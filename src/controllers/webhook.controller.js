// webhook.controller.js
const crypto = require("crypto");
const { dealEvents } = require("../services/payment.services"); // ✅ import dealEvents

exports.handle = async (req, res) => {
  try {
    const signature = req.headers["x-pesacrow-signature"];
    const secret = process.env.PESACROW_WEBHOOK_SECRET;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expected) {
      console.log("❌ Invalid webhook signature");
      return res.status(401).send("Bad Signature");
    }

    const event = JSON.parse(req.body.toString());
    console.log("📦 Raw event:", JSON.stringify(event, null, 2));

    const { transactionId, externalId, newStatus: status, oldStatus, amount } = event.data;

    console.log(`✅ Webhook received: [${event.event}] ${transactionId} → ${oldStatus} → ${status}`);

    // ✅ Notify any waiting waitForStatus / waitForRelease
    dealEvents.emit(transactionId, event.data);

    switch (status) {
      case "held":
        console.log(`💰 Payment of KES ${amount} held for ${transactionId} (order: ${externalId})`);
        break;
      case "delivered":
        console.log(`📦 Marked delivered for ${transactionId}`);
        break;
      case "released":
        console.log(`🎉 Payment released for ${transactionId} (order: ${externalId})`);
        break;
      case "disputed":
        console.log(`⚠️ Dispute raised for ${transactionId}`);
        break;
      case "refunded":
        console.log(`↩️ Refunded for ${transactionId}`);
        break;
      default:
        console.log(`⚠️ Unknown status "${status}" for event: ${event.event}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Server Error");
  }
};