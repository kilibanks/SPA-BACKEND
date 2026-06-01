const crypto = require("crypto");
const { pool } = require("../config/db");
const { dealEvents } = require("../modules/payments/payment.services");
const paymentStore = require("../modules/payments/payment.store");
const appointmentRepository = require("../modules/appointments/appointment.repository");
const {
  sendPaymentReceiptEmail,
  sendAdminPaymentNotificationEmail,
} = require("../services/email.service");

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

    dealEvents.emit(transactionId, event.data);

    switch (status) {
      case "held": {
        console.log(`💰 Payment of KES ${amount} held for ${transactionId}`);

        const paymentData = paymentStore.get(transactionId);

        if (!paymentData) {
          console.log(`⚠️ No paymentData found for ${transactionId} — already processed or unknown`);
          break;
        }

        // Delete FIRST to prevent duplicate processing if webhook fires twice
        paymentStore.delete(transactionId);

        const paymentRecord = await appointmentRepository.findPaymentByTransactionId(transactionId);

        if (paymentRecord) {
          // Update payment: mark as Paid + set pesacrow_status to held
          await pool.query(
            "UPDATE payments SET payment_status = 'Paid', pesacrow_status = 'held' WHERE transaction_id = ?",
            [transactionId],
          );
          console.log(`✅ Updated payment status to Paid for transaction ${transactionId}`);

          // Also mark the appointment as paid
          await pool.query(
            "UPDATE client_appointments SET payment_status = 'Paid' WHERE appointment_id = ?",
            [paymentRecord.appointment_id],
          );
          console.log(`✅ Updated appointment ${paymentRecord.appointment_id} payment_status to Paid`);
        } else {
          console.log(`⚠️ No payment record found for transaction ${transactionId}`);
        }

        if (paymentData.email) {
          await Promise.all([
            sendPaymentReceiptEmail(paymentData.email, transactionId, amount),
            sendAdminPaymentNotificationEmail(paymentData.email, transactionId, amount),
          ]);
          console.log(`📧 Emails sent to ${paymentData.email} and admin`);
        }

        break;
      }

      case "delivered": {
        console.log(`📦 Marked delivered for ${transactionId}`);
        await pool.query(
          "UPDATE payments SET pesacrow_status = 'delivered' WHERE transaction_id = ?",
          [transactionId],
        );
        break;
      }

      case "released": {
        console.log(`🎉 Payment released for ${transactionId} (order: ${externalId})`);
        await pool.query(
          "UPDATE payments SET pesacrow_status = 'released' WHERE transaction_id = ?",
          [transactionId],
        );
        break;
      }

      case "disputed": {
        console.log(`⚠️ Dispute raised for ${transactionId}`);
        await pool.query(
          "UPDATE payments SET pesacrow_status = 'disputed' WHERE transaction_id = ?",
          [transactionId],
        );
        break;
      }

      case "refunded": {
        console.log(`↩️ Refunded for ${transactionId}`);
        await pool.query(
          "UPDATE payments SET pesacrow_status = 'refunded', payment_status = 'Refunded' WHERE transaction_id = ?",
          [transactionId],
        );
        // Also mark appointment as Refunded
        const paymentRecord = await appointmentRepository.findPaymentByTransactionId(transactionId);
        if (paymentRecord) {
          await pool.query(
            "UPDATE client_appointments SET payment_status = 'Refunded' WHERE appointment_id = ?",
            [paymentRecord.appointment_id],
          );
        }
        break;
      }

      default:
        console.log(`⚠️ Unknown status "${status}" for event: ${event.event}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Server Error");
  }
};