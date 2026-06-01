const express = require("express");
const router = express.Router();
const appointmentController = require("./appointment.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createAppointmentSchema,
  updateStatusSchema,
  createPaymentSchema,
  assignEmployeeSchema,
} = require("./appointment.validation");

router.use(authMiddleware);

router.post(
  "/",
  validate(createAppointmentSchema),
  appointmentController.createAppointment,
);
// Admin: list all bookings
router.get("/admin/bookings", appointmentController.getAllBookings);
router.get("/admin/employees", appointmentController.getActiveEmployees);
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
router.post(
  "/:id/pay",
  validate(createPaymentSchema),
  appointmentController.createPayment,
);

// Cancel appointment (client cancels their own appointment)
router.post("/:id/cancel", appointmentController.cancelAppointment);

// Admin: assign employee to appointment
router.patch(
  "/:id/assign",
  validate(assignEmployeeSchema),
  appointmentController.assignEmployee,
);

module.exports = router;
