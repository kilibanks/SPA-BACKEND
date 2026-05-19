// payment.services.js
const axios = require("axios");
const EventEmitter = require("events");
const paymentStore = require("./payment.store");

const BASE_URL = process.env.PESA_CROW_BASE_URL;

const dealEvents = new EventEmitter();
dealEvents.setMaxListeners(50);
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

    if (amount<20) throw new Error("The minimum amount is KES 20");


    const dealPush = await axios.post(`${BASE_URL}/deals/create`, payload, {
      headers: { "x-api-key": process.env.API_KEY, "Content-Type": "application/json" },
    });


    const transactionId =
      dealPush.data?.transactionId ?? dealPush.data?.data?.transactionId;
    if (!transactionId) throw new Error("transactionId missing from createDeal response");


    return transactionId;
  } catch (error) {
  console.error(
    "PESACROW createDeal ERROR:",
    error.response?.data || error.message
  );

  throw new Error(
    error.response?.data?.message ||
    error.message ||
    "Deal creation failed"
  );
}
};

const waitForStatus = (transactionId, timeoutMs = 27000) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      dealEvents.off(transactionId, handler);
      resolve({
        paid: false,
        status: "timeout",
        transactionId,
        message: "Payment not received. Please try again.",
      });
    }, timeoutMs);

    const handler = (eventData) => {
      if (eventData.newStatus === "pending_payment") return;

      clearTimeout(timer);
      dealEvents.off(transactionId, handler);

      if (eventData.newStatus === "held") {
        resolve({ paid: true, status: "held", transactionId });
      } else {
        resolve({
          paid: false,
          status: eventData.newStatus,
          transactionId,
          message: `Payment ${eventData.newStatus}. Please try again.`,
        });
      }
    };

    dealEvents.on(transactionId, handler);
  });
};

const topUp = async ({ buyerPhone, amount, email }) => {

  if (!buyerPhone) throw new Error("buyerPhone is required");
  if (!amount) throw new Error("amount is required");
  if (!email) throw new Error("email is required");

  const normalizedPhone = normalizePhone(buyerPhone);

  const transactionId = await createDeal({
    buyerPhone: normalizedPhone,
    amount,
  });

  // SAVE EMAIL TEMPORARILY
  paymentStore.set(transactionId, {
    email,
    amount,
    phone: normalizedPhone,
  });

  await axios.post(
    `${BASE_URL}/payments/initiate-stk`,
    {
      transactionId,
      buyerPhone: normalizedPhone,
      description: "Service",
    },
    {
      headers: {
        "x-api-key": process.env.API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return waitForStatus(transactionId, 27000);
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

const waitForRelease = (transactionId) => {
  return waitForStatus(transactionId, 180000); // ✅ 2 args only, 3 mins
};

module.exports = { topUp, deliverDeal, waitForRelease, dealEvents };