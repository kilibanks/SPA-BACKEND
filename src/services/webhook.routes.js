// webhook.routes.js
const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook.controller");

// ⚠️ IMPORTANT: raw body needed for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), webhookController.handle);

module.exports = router;