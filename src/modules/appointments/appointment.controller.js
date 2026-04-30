const appointmentService = require("./appointment.service");
const ApiResponse = require("../../utils/ApiResponse");

const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(
      req.user.id,
      req.body,
    );
    return res
      .status(201)
      .json(
        ApiResponse.success("Appointment created successfully", appointment),
      );
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAppointmentsForUser(
      req.user.id,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Appointments fetched successfully", appointments),
      );
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.user.id,
      req.params.id,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Appointment fetched successfully", appointment),
      );
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateAppointmentStatus(
      req.user.id,
      req.params.id,
      req.body.status,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Appointment status updated successfully",
          appointment,
        ),
      );
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await appointmentService.createPayment(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment recorded successfully", payment));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  createPayment,
};
