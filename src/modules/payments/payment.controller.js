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