const appointmentRepository = require("./appointment.repository");
const paymentService = require("../payments/payment.services");
const ApiError = require("../../utils/ApiError");
const emailService = require("../../services/email.service");

const createAppointment = async (
  userId,
  { staff_id, service_ids, scheduled_at, notes },
) => {
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

  // Send email in background — don't let it block or crash the response
  emailService
    .sendAppointmentStatusEmail(
      appointmentDetails.user_email,
      appointmentDetails.user_name,
      appointmentDetails,
      appointmentDetails.status,
    )
    .catch((err) => console.error("Email send error (createAppointment):", err.message));

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

  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const updated = await appointmentRepository.assignEmployeeToAppointment(
    appointmentId,
    employeeId,
  );

  emailService
    .sendAppointmentStatusEmail(
      updated.user_email,
      updated.user_name,
      updated,
      updated.status,
    )
    .catch((err) => console.error("Email send error (assignEmployee):", err.message));

  return updated;
};

const updateAppointmentStatus = async (userId, appointmentId, status) => {
  const appointment =
    await appointmentRepository.getAppointmentDetails(appointmentId);
  if (!appointment || appointment.user_id !== userId) {
    throw new ApiError(404, "Appointment not found");
  }

  await appointmentRepository.updateAppointmentStatus(appointmentId, status);
  const updatedDetails =
    await appointmentRepository.getAppointmentDetails(appointmentId);

  emailService
    .sendAppointmentStatusEmail(
      updatedDetails.user_email,
      updatedDetails.user_name,
      updatedDetails,
      status,
    )
    .catch((err) => console.error("Email send error (updateStatus):", err.message));

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
    if (!phone_number) throw new ApiError(400, "phone_number is required for Mpesa");

    // Step 1: create deal + fire STK push, get transactionId back immediately
    const transactionId = await paymentService.initiateMpesa({
      buyerPhone: phone_number,
      amount,
      email: appointment.user_email,
    });

    // Step 2: save payment row NOW so webhook can find it when held fires
    await appointmentRepository.createPayment({
      appointment_id: appointmentId,
      amount,
      method: "Mpesa",
      transaction_id: transactionId,
      status: "Pending",
    });

    // Step 3: wait for webhook to confirm payment held (27s timeout)
    const result = await paymentService.waitForStatus(transactionId, 27000);

    if (!result.paid) {
      throw new ApiError(408, result.message || "Mpesa payment not completed");
    }

    // Return the updated payment row (webhook will have set it to Paid by now)
    return await appointmentRepository.findPaymentByTransactionId(transactionId);
  }

  // Cash / Card / Bank Transfer / Other
  const payment = await appointmentRepository.createPayment({
    appointment_id: appointmentId,
    amount,
    method,
    transaction_id: transaction_id || null,
    status: "Paid",
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