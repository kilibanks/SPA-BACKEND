// payment.services.js
const axios = require("axios");
const EventEmitter = require("events");

const BASE_URL = process.env.PESA_CROW_BASE_URL;

// Shared event bus — webhook controller emits here, topUp/deliverDeal listen here
const dealEvents = new EventEmitter();
dealEvents.setMaxListeners(50); // allow concurrent deals
module.exports.dealEvents = dealEvents;

const normalizePhone = (phone) => {
  if (!phone) throw new Error("normalizePhone: phone is undefined or null");
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  throw new Error(`Unrecognized phone format: ${phone}`);
};

const createDeal = async ({ buyerPhone, amount }) => {
  try {
    const payload = {
      amount,
      buyerPhone: normalizePhone(buyerPhone),
      sellerPhone: normalizePhone("0793590680"),
      description: "Service",
    };

    const dealPush = await axios.post(`${BASE_URL}/deals/create`, payload, {
      headers: { "x-api-key": process.env.API_KEY, "Content-Type": "application/json" },
    });

    const transactionId =
      dealPush.data?.transactionId ?? dealPush.data?.data?.transactionId;
    if (!transactionId) throw new Error("transactionId missing from createDeal response");

    return transactionId;
  } catch (error) {
    console.error("PESACROW createDeal ERROR:", error.response?.data || error.message);
    throw new Error("Deal creation failed");
  }
};

// Waits for the webhook to emit a specific status for a transactionId
const waitForStatus = (transactionId, targetStatus, timeoutMs = 90000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      dealEvents.off(transactionId, handler);
      reject(new Error(`Timeout waiting for "${targetStatus}" on ${transactionId}`));
    }, timeoutMs);

    const handler = (eventData) => {
      if (eventData.newStatus === targetStatus) {
        clearTimeout(timer);
        dealEvents.off(transactionId, handler);
        resolve({ paid: true, status: targetStatus, transactionId });
      }

      // Early exit on terminal failure statuses
      const failed = ["cancelled", "failed", "rejected", "refunded", "disputed"];
      if (failed.includes(eventData.newStatus)) {
        clearTimeout(timer);
        dealEvents.off(transactionId, handler);
        resolve({ paid: false, status: eventData.newStatus, transactionId });
      }
    };

    dealEvents.on(transactionId, handler);
  });
};

const topUp = async ({ buyerPhone, amount }) => {
  console.log("topUp called with:", { buyerPhone, amount });
  if (!buyerPhone) throw new Error("buyerPhone is required");
  if (!amount) throw new Error("amount is required");

  const normalizedPhone = normalizePhone(buyerPhone);
  const transactionId = await createDeal({ buyerPhone: normalizedPhone, amount });

  await axios.post(
    `${BASE_URL}/payments/initiate-stk`,
    { transactionId, buyerPhone: normalizedPhone, description: "Service" },
    { headers: { "x-api-key": process.env.API_KEY, "Content-Type": "application/json" } }
  );

  // ✅ No polling — resolves when webhook fires
  return waitForStatus(transactionId, "held", 27000);
};

const deliverDeal = async (transactionId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/deals/${transactionId}/deliver`,
      {},
      { headers: { "x-api-key": process.env.API_KEY, "Content-Type": "application/json" } }
    );
    console.log("Deliver response:", response.data);
    return response.data;
  } catch (error) {
    console.error("deliverDeal ERROR:", error.response?.data || error.message);
    throw new Error("Mark as delivered failed");
  }
};

const waitForRelease = (transactionId, timeoutMs = 360000) => {
  return waitForStatus(transactionId, "released", timeoutMs);
};

module.exports = { topUp, deliverDeal, waitForRelease, dealEvents };