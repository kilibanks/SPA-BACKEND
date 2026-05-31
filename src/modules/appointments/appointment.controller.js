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

const getAllBookings = async (req, res, next) => {
  try {
    // admin-only
    if (req.user.role !== "admin") {
      return res.status(403).json(ApiResponse.error("Forbidden"));
    }
    const bookings = await appointmentService.getAllBookings();
    return res.status(200).json(ApiResponse.success("Bookings fetched", bookings));
  } catch (error) {
    next(error);
  }
};

const assignEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json(ApiResponse.error("Forbidden"));
    }
    const appointment = await appointmentService.assignEmployee(
      req.user.id,
      req.params.id,
      req.body.employee_id,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Employee assigned", appointment));
  } catch (error) {
    next(error);
  }
};

const getActiveEmployees = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json(ApiResponse.error("Forbidden"));
    }
    const employees = await appointmentService.getActiveEmployees();
    return res.status(200).json(ApiResponse.success("Employees fetched", employees));
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
  getAllBookings,
  getActiveEmployees,
  assignEmployee,
};
