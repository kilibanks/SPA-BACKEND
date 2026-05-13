const axios = require("axios");

const BASE_URL = process.env.PESA_CROW_BASE_URL;

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
      headers: {
        "x-api-key": process.env.API_KEY,
        "Content-Type": "application/json",
      },
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

// ✅ NEW: Poll /open/deals/:transactionId until status === "held" or timeout
const pollDealStatus = async (transactionId, { intervalMs = 3000, timeoutMs = 60000 } = {}) => {
  const url = `${BASE_URL}/open/deals/${transactionId}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const { data } = await axios.get(url);

      console.log(`Polling ${transactionId}:`, data?.data?.status);

      const status = data?.data?.status;

      if (status === "held") {
        return { paid: true, status, transactionId };
      }

      // Optional: treat cancelled/failed statuses as early exit
      if (status === "cancelled" || status === "failed" || status === "rejected") {
        return { paid: false, status, transactionId };
      }
    } catch (error) {
      console.error("Polling error:", error.response?.data || error.message);
      // Don't throw — just keep retrying until timeout
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Timed out
  return { paid: false, status: "timeout", transactionId };
};

const topUp = async ({ buyerPhone, amount }) => {
  console.log("topUp called with:", { buyerPhone, amount });

  if (!buyerPhone) throw new Error("buyerPhone is required");
  if (!amount) throw new Error("amount is required");

  const normalizedPhone = normalizePhone(buyerPhone);
  const transactionId = await createDeal({ buyerPhone: normalizedPhone, amount });

  const payload = {
    transactionId,
    buyerPhone: normalizedPhone,
    description: "Service",
  };

  // Initiate STK push
  await axios.post(`${BASE_URL}/payments/initiate-stk`, payload, {
    headers: {
      "x-api-key": process.env.API_KEY,
      "Content-Type": "application/json",
    },
  });

  // ✅ Now wait for actual payment confirmation
  const result = await pollDealStatus(transactionId, {
    intervalMs: 3000,   // check every 3 seconds
    timeoutMs: 30000,   // wait up to 90 seconds
  });

  return result;
};

const deliverDeal = async (transactionId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/deals/${transactionId}/deliver`,
      {},
      {
        headers: {
          "x-api-key": process.env.API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Deliver response:", response.data);
    return response.data;
  } catch (error) {
    console.error("deliverDeal ERROR:", error.response?.data || error.message);
    throw new Error("Mark as delivered failed");
  }
};

// Also add polling for "released" status
const pollForRelease = async (transactionId, { intervalMs = 5000, timeoutMs = 300000 } = {}) => {
  const url = `${BASE_URL}/open/deals/${transactionId}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const { data } = await axios.get(url);
      const status = data?.data?.status;
      console.log(`Polling for release ${transactionId}:`, status);

      if (status === "released") return { released: true, status, transactionId };
      if (status === "refunded" || status === "failed" || status === "disputed") {
        return { released: false, status, transactionId };
      }
    } catch (error) {
      console.error("Release poll error:", error.response?.data || error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { released: false, status: "timeout", transactionId };
};

module.exports = { topUp, deliverDeal, pollForRelease };