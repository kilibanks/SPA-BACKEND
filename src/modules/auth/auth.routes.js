const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');

const validate = require('../../middlewares/validate.middleware');

const {
  registerSchema,
  loginSchema,
  verifyEmailSchema
} = require('./auth.validation');

router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

router.post(
  '/logout',
  authController.logout
);

router.post(
  "/check-email",
  authController.checkEmail
);

router.post(
  '/resend-verification',
  authController.resendVerification
);

module.exports = router;