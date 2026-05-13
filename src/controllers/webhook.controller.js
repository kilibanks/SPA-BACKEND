// webhook.controller.js
const crypto = require("crypto");

exports.handle = async (req, res) => {
  try {
    // Step 1: Verify signature
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

    // Step 2: Parse the body
    const event = JSON.parse(req.body.toString());
    console.log("📦 Raw event:", JSON.stringify(event, null, 2));

    // ✅ Destructure from event.data, alias newStatus → status
    const { transactionId, externalId, newStatus: status, oldStatus, amount } = event.data;

    console.log(`✅ Webhook received: [${event.event}] ${transactionId} → ${oldStatus} → ${status}`);

    // Step 3: Handle each status
    switch (status) {
      case "held":
        console.log(`💰 Payment of KES ${amount} held for ${transactionId} (order: ${externalId})`);
        // TODO: mark order as payment_received
        break;

      case "delivered":
        console.log(`📦 Marked delivered for ${transactionId}`);
        break;

      case "released":
        console.log(`🎉 Payment released for ${transactionId} (order: ${externalId})`);
        // TODO: update DB order status to "paid"
        break;

      case "disputed":
        console.log(`⚠️ Dispute raised for ${transactionId}`);
        // TODO: flag order for review
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