// payment.controller.js
const paymentService = require("./payment.services");

exports.pay = async (req, res, next) => {
  try {
    const { phone_number, amount } = req.body;
    const buyerPhone = phone_number;

    if (!buyerPhone || !amount) {
      return res.status(400).json({
        success: false,
        message: "phone_number and amount are required",
      });
    }

    const result = await paymentService.topUp({ buyerPhone, amount });

    if (result.paid) {
      return res.status(200).json({
        success: true,
        message: "Payment received successfully",
        transactionId: result.transactionId,
      });
    }

    const statusMessages = {
      timeout: "Payment not completed within the allowed time",
      cancelled: "Payment was cancelled",
      failed: "Payment failed",
      rejected: "Payment was rejected",
    };

    return res.status(408).json({
      success: false,
      message: statusMessages[result.status] ?? "Payment not completed",
      status: result.status,
      transactionId: result.transactionId,
    });

  } catch (error) {
    next(error);
  }
};

// ✅ NEW: Mark service as delivered → triggers SMS to buyer for approval
exports.deliver = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "transactionId is required",
      });
    }

    // Step 1: Mark as delivered (sends SMS to buyer)
    await paymentService.deliverDeal(transactionId);

    // Step 2: Poll until buyer approves and status becomes "released"
    const result = await paymentService.waitForRelease(transactionId);

    if (result.released) {
      return res.status(200).json({
        success: true,
        message: "✅ Payment released to seller successfully!",
        transactionId,
      });
    }

    // Buyer hasn't approved yet within the wait window
    const releaseStatusMessages = {
      timeout: "Marked as delivered. Waiting for buyer SMS approval — funds not yet released.",
      disputed: "Transaction is under dispute.",
      refunded: "Transaction was refunded to buyer.",
      failed: "Transaction failed.",
    };

    return res.status(202).json({
      success: false,
      message: releaseStatusMessages[result.status] ?? "Delivery marked. Awaiting buyer approval.",
      status: result.status,
      transactionId,
    });

  } catch (error) {
    next(error);
  }
};