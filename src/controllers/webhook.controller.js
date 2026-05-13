// webhook.controller.js
const crypto = require("crypto");

exports.handle = async (req, res) => {
  try {
    // Step 1: Verify signature
    const signature = req.headers["x-pesacrow-signature"];
    const secret = process.env.PESACROW_WEBHOOK_SECRET; // from your dashboard

    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.body) // raw body, NOT parsed JSON
      .digest("hex");

    if (signature !== expected) {
      console.log("❌ Invalid webhook signature");
      return res.status(401).send("Bad Signature");
    }

    // Step 2: Parse the body
    const event = JSON.parse(req.body.toString());
    const { transactionId, status } = event;

    console.log(`✅ Webhook received: ${transactionId} → ${status}`);

    // Step 3: Handle each status
    switch (status) {
      case "held":
        // Money received from buyer, sitting in escrow
        console.log(`💰 Payment held for ${transactionId}`);
        break;

      case "delivered":
        // You marked as delivered, waiting for buyer SMS approval
        console.log(`📦 Marked delivered for ${transactionId}`);
        break;

      case "released":
        // 🎉 Buyer approved! Money sent to your M-Pesa
        console.log(`🎉 Payment released for ${transactionId}`);
        // TODO: update your DB order status to "paid"
        break;

      case "disputed":
        // Buyer raised an issue
        console.log(`⚠️ Dispute raised for ${transactionId}`);
        // TODO: flag order for review
        break;

      case "refunded":
        // Buyer was refunded
        console.log(`↩️ Refunded for ${transactionId}`);
        break;

      default:
        console.log(`Unknown status: ${status}`);
    }

    // Always return 200 so PesaCrow stops retrying
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Server Error");
  }
};