const appointmentRepository = require("./appointment.repository");
const ApiError = require("../../utils/ApiError");
const emailService = require("../../services/email.service");

const createAppointment = async (
  userId,
  { staff_id, service_ids, scheduled_at, notes },
) => {
  const staff = await appointmentRepository.findStaffById(staff_id);
  if (!staff) {
    throw new ApiError(400, "Selected staff member does not exist");
  }

  const services = await appointmentRepository.findServicesByIds(service_ids);
  if (services.length !== service_ids.length) {
    throw new ApiError(400, "One or more selected services are invalid");
  }

  const appointment = await appointmentRepository.createAppointment({
    user_id: userId,
    staff_id,
    scheduled_at,
    notes,
  });

  await appointmentRepository.addAppointmentServices(
    appointment.id,
    service_ids,
  );
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
