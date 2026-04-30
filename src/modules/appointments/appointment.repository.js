const { pool } = require("../../config/db");

const createAppointment = async ({
  user_id,
  staff_id,
  scheduled_at,
  notes,
}) => {
  const [result] = await pool.query(
    "INSERT INTO appointments (user_id, staff_id, scheduled_at, notes) VALUES (?, ?, ?, ?)",
    [user_id, staff_id, scheduled_at, notes || null],
  );
  return getAppointmentDetails(result.insertId);
};

const addAppointmentServices = async (appointment_id, serviceIds) => {
  const values = serviceIds.map((serviceId) => [appointment_id, serviceId]);
  if (!values.length) return;
  await pool.query(
    "INSERT INTO appointment_services (appointment_id, service_id) VALUES ?",
    [values],
  );
};

const updateAppointmentStatus = async (appointmentId, status) => {
  await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [
    status,
    appointmentId,
  ]);
  return getAppointmentDetails(appointmentId);
};

const getAppointmentDetails = async (appointmentId) => {
  const [appointments] = await pool.query(
    `SELECT
      a.id,
      a.user_id,
      u.name AS user_name,
      u.email AS user_email,
      a.staff_id,
      s.name AS staff_name,
      s.email AS staff_email,
      a.status,
      a.scheduled_at,
      a.notes,
      a.created_at
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN staff s ON a.staff_id = s.id
    WHERE a.id = ?`,
    [appointmentId],
  );

  const appointment = appointments[0];
  if (!appointment) return null;

  const [services] = await pool.query(
    `SELECT
      svc.id,
      svc.title,
      svc.description,
      svc.price,
      svc.duration_minutes,
      appt_service.quantity
    FROM appointment_services appt_service
    JOIN services svc ON appt_service.service_id = svc.id
    WHERE appt_service.appointment_id = ?`,
    [appointmentId],
  );

  const [payments] = await pool.query(
    "SELECT id, amount, method, status, transaction_id, created_at FROM payments WHERE appointment_id = ?",
    [appointmentId],
  );

  return {
    ...appointment,
    services,
    payments,
  };
};

const getAppointmentsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      a.id,
      a.user_id,
      a.staff_id,
      s.name AS staff_name,
      a.status,
      a.scheduled_at,
      a.notes,
      a.created_at
    FROM appointments a
    LEFT JOIN staff s ON a.staff_id = s.id
    WHERE a.user_id = ?
    ORDER BY a.scheduled_at DESC`,
    [userId],
  );

  return Promise.all(
    rows.map(async (appointment) => {
      const [services] = await pool.query(
        `SELECT svc.id, svc.title, svc.price, svc.duration_minutes, appt_service.quantity
       FROM appointment_services appt_service
       JOIN services svc ON appt_service.service_id = svc.id
       WHERE appt_service.appointment_id = ?`,
        [appointment.id],
      );
      return { ...appointment, services };
    }),
  );
};

const createPayment = async ({
  appointment_id,
  amount,
  method,
  transaction_id,
}) => {
  const [result] = await pool.query(
    "INSERT INTO payments (appointment_id, amount, method, transaction_id) VALUES (?, ?, ?, ?)",
    [appointment_id, amount, method, transaction_id],
  );
  const [rows] = await pool.query(
    "SELECT id, appointment_id, amount, method, status, transaction_id, created_at FROM payments WHERE id = ?",
    [result.insertId],
  );
  return rows[0];
};

const findStaffById = async (staffId) => {
  const [rows] = await pool.query("SELECT * FROM staff WHERE id = ?", [
    staffId,
  ]);
  return rows[0] || null;
};

const findServicesByIds = async (serviceIds) => {
  if (!serviceIds || !serviceIds.length) return [];
  const placeholders = serviceIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT * FROM services WHERE id IN (${placeholders})`,
    serviceIds,
  );
  return rows;
};

module.exports = {
  createAppointment,
  addAppointmentServices,
  updateAppointmentStatus,
  getAppointmentDetails,
  getAppointmentsByUser,
  createPayment,
  findStaffById,
  findServicesByIds,
};
