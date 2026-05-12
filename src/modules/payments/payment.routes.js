const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");

router.post("/pay", paymentController.pay);

module.exports = router;