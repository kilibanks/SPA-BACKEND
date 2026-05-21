const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');

const validate = require('../../middlewares/validate.middleware');

const {
  registerSchema,
  loginSchema,
  verifyEmailSchema
} = require('./auth.validation');



router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Auth route is working!' });
});

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

/*router.post(
  '/login',
  validate(loginSchema),
  authController.login
);*/

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


router.post("/login/initiate", authController.initiateLogin);
router.post("/login/verify-code", authController.verifyLoginCode);

module.exports = router;