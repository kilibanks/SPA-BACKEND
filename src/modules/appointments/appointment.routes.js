const express = require("express");
const router = express.Router();
const appointmentController = require("./appointment.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createAppointmentSchema,
  updateStatusSchema,
  createPaymentSchema,
} = require("./appointment.validation");

router.use(authMiddleware);

router.post(
  "/",
  validate(createAppointmentSchema),
  appointmentController.createAppointment,
);
router.get("/", appointmentController.getAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  appointmentController.updateAppointmentStatus,
);
router.post(
  "/:id/payments",
  validate(createPaymentSchema),
  appointmentController.createPayment,
);

module.exports = router;
