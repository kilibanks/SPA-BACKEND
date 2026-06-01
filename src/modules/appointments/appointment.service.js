const appointmentRepository = require("./appointment.repository");
const paymentService = require("../payments/payment.services");
const ApiError = require("../../utils/ApiError");
const emailService = require("../../services/email.service");

const createAppointment = async (
  userId,
  { staff_id, service_ids, scheduled_at, notes },
) => {
  // If staff_id is provided (should only be by admin), validate it. Otherwise allow null.
  let employeeId = null;
  if (staff_id) {
    const employee = await appointmentRepository.findEmployeeById(staff_id);
    if (!employee) {
      throw new ApiError(400, "Selected staff member does not exist");
    }
    employeeId = staff_id;
  }

  const services = await appointmentRepository.findServicesByIds(service_ids);
  if (services.length !== service_ids.length) {
    throw new ApiError(400, "One or more selected services are invalid");
  }

  const [date, time] = scheduled_at.split("T");
  const appointment = await appointmentRepository.createAppointment({
    customer_id: userId,
    service_id: service_ids && service_ids.length ? service_ids[0] : null,
    employee_id: employeeId,
    appointment_date: date,
    appointment_time: time,
    notes,
  });

  const appointmentDetails = await appointmentRepository.getAppointmentDetails(
    appointment.id,
  );

  await emailService.sendAppointmentStatusEmail(
    appointmentDetails.user_email,
    appointmentDetails.user_name,
    appointmentDetails,
    appointmentDetails.status,
  );

  return appointmentDetails;
};

const getAppointmentsForUser = async (userId) => {
  return await appointmentRepository.getAppointmentsByUser(userId);
};

const getActiveEmployees = async () => {
  return await appointmentRepository.getActiveEmployees();
};

const getAppointmentById = async (userId, appointmentId) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }
  return appointment;
};

const getAllBookings = async () => {
  return await appointmentRepository.getAllAppointments();
};

const assignEmployee = async (adminId, appointmentId, employeeId) => {
  const employee = await appointmentRepository.findEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(400, "Employee not found");
  }

  // ensure appointment exists
  const appointment = await appointmentRepository.getAppointmentDetails(
    appointmentId,
  );
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const updated = await appointmentRepository.assignEmployeeToAppointment(
    appointmentId,
    employeeId,
  );

  // notify customer
  await emailService.sendAppointmentStatusEmail(
    updated.user_email,
    updated.user_name,
    updated,
    updated.status,
  );

  return updated;
};

const updateAppointmentStatus = async (userId, appointmentId, status) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }

  const updated = await appointmentRepository.updateAppointmentStatus(
    appointmentId,
    status,
  );
  const updatedDetails =
    await appointmentRepository.getAppointmentDetails(appointmentId);

  await emailService.sendAppointmentStatusEmail(
    updatedDetails.user_email,
    updatedDetails.user_name,
    updatedDetails,
    status,
  );
  return updatedDetails;
};

const createPayment = async (
  userId,
  appointmentId,
  { amount, method, transaction_id, phone_number },
) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }

  if (method === "mpesa") {
    const result = await paymentService.topUp({
      buyerPhone: phone_number,
      amount,
      email: appointment.user_email,
    });

    const payment = await appointmentRepository.createPayment({
      appointment_id: appointmentId,
      amount,
      method,
      transaction_id: result.transactionId,
      phone_number,
      status: result.paid ? "completed" : "pending",
    });

    if (!result.paid) {
      throw new ApiError(408, result.message || "Mpesa payment not completed");
    }

    return payment;
  }

  const payment = await appointmentRepository.createPayment({
    appointment_id: appointmentId,
    amount,
    method,
    transaction_id: transaction_id || null,
    phone_number: phone_number || null,
    status: "completed",
  });

  return payment;
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
  getAppointmentById,
  getAllBookings,
  getActiveEmployees,
  assignEmployee,
  updateAppointmentStatus,
  createPayment,
};
