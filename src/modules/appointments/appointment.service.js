const appointmentRepository = require("./appointment.repository");
const ApiError = require("../../utils/ApiError");
const emailService = require("../../services/email.service");

const createAppointment = async (
  userId,
  { staff_id, service_ids, scheduled_at, notes },
) => {
  const employee = await appointmentRepository.findEmployeeById(staff_id);
  if (!employee) {
    throw new ApiError(400, "Selected staff member does not exist");
  }

  const services = await appointmentRepository.findServicesByIds(service_ids);
  if (services.length !== service_ids.length) {
    throw new ApiError(400, "One or more selected services are invalid");
  }

  const [date, time] = scheduled_at.split("T");
  const appointment = await appointmentRepository.createAppointment({
    customer_id: userId,
    employee_id: staff_id,
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

  return appointmentDetails;  // ← single }; here
};

const getAppointmentsForUser = async (userId) => {
  return await appointmentRepository.getAppointmentsByUser(userId);
};

const getAppointmentById = async (userId, appointmentId) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }
  return appointment;
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
  { amount, method, transaction_id },
) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }

  const payment = await appointmentRepository.createPayment({
    appointment_id: appointmentId,
    amount,
    method,
    transaction_id,
    status: "completed",
  });

  return payment;
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
  getAppointmentById,
  updateAppointmentStatus,
  createPayment,
};
