const { pool } = require("../../config/db");

const createAppointment = async ({
  customer_id,
  service_id,
  employee_id,
  appointment_date,
  appointment_time,
  notes,
}) => {
  const [result] = await pool.query(
    "INSERT INTO client_appointments (customer_id, service_id, employee_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [customer_id, service_id, employee_id || null, appointment_date, appointment_time, notes || null],
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
  await pool.query(
    "UPDATE client_appointments SET status = ? WHERE appointment_id = ?",
    [status, appointmentId],
  );
  return getAppointmentDetails(appointmentId);
};

const assignEmployeeToAppointment = async (appointmentId, employeeId) => {
  await pool.query(
    "UPDATE client_appointments SET employee_id = ? WHERE appointment_id = ?",
    [employeeId, appointmentId],
  );
  return getAppointmentDetails(appointmentId);
};

const getAppointmentDetails = async (appointmentId) => {
  const [appointments] = await pool.query(
    `SELECT
      ca.appointment_id AS id,
      ca.customer_id AS user_id,
      c.email AS user_email,
      c.first_name AS user_name,
      ca.employee_id AS staff_id,
      CONCAT(e.first_name, ' ', e.last_name) AS staff_name,
      ca.status,
      ca.appointment_date,
      ca.appointment_time,
      ca.notes,
      ca.created_at,
      ca.service_id
    FROM client_appointments ca
    LEFT JOIN customers c ON ca.customer_id = c.customer_id
    LEFT JOIN employees e ON ca.employee_id = e.employee_id
    WHERE ca.appointment_id = ?`,
    [appointmentId],
  );

  const appointment = appointments[0];
  if (!appointment) return null;

  const [services] = await pool.query(
    `SELECT
      s.service_id AS id,
      s.title,
      s.description,
      s.price,
      s.duration_minutes
    FROM services s
    WHERE s.service_id = ?`,
    [appointment.service_id],
  );

  const [payments] = await pool.query(
    "SELECT * FROM payments WHERE appointment_id = ?",
    [appointmentId],
  );

  return {
    ...appointment,
    services: services || [],
    payments: payments || [],
  };
};

const getAppointmentsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      ca.appointment_id AS id,
      ca.customer_id AS user_id,
      ca.employee_id AS staff_id,
      CONCAT(e.first_name, ' ', e.last_name) AS staff_name,
      ca.status,
      ca.appointment_date,
      ca.appointment_time,
      ca.notes,
      ca.created_at,
      ca.service_id
    FROM client_appointments ca
    LEFT JOIN employees e ON ca.employee_id = e.employee_id
    WHERE ca.customer_id = ?
    ORDER BY ca.appointment_date DESC, ca.appointment_time DESC`,
    [userId],
  );

  return Promise.all(
    rows.map(async (appointment) => {
      const [services] = await pool.query(
        `SELECT s.service_id AS id, s.title, s.price, s.duration_minutes
         FROM services s
         WHERE s.service_id = ?`,
        [appointment.service_id],
      );
      const [payments] = await pool.query(
        "SELECT * FROM payments WHERE appointment_id = ?",
        [appointment.id],
      );
      return { ...appointment, services: services || [], payments: payments || [] };
    }),
  );
};

const createPayment = async ({
  appointment_id,
  amount,
  method,
  transaction_id,
  phone_number,
  status = "completed",
}) => {
  const values = {
    appointment_id,
    amount,
    method,
    status,
    transaction_id,
    phone_number,
  };

  const insertWithColumns = async (columns) => {
    const placeholders = columns.map(() => "?").join(", ");
    const query = `INSERT INTO payments (${columns.join(", ")}) VALUES (${placeholders})`;
    const params = columns.map((column) => values[column]);
    return await pool.query(query, params);
  };

  const candidateColumns = [
    "appointment_id",
    "amount",
    "method",
    "status",
    "transaction_id",
    "phone_number",
  ];

  let columns = candidateColumns.filter((column) => values[column] !== undefined);

  while (true) {
    try {
      const [result] = await insertWithColumns(columns);
      const [rows] = await pool.query(
        "SELECT * FROM payments WHERE id = ?",
        [result.insertId],
      );
      return rows[0];
    } catch (error) {
      if (error.code === "ER_BAD_FIELD_ERROR") {
        const match = /Unknown column '(.+?)'/.exec(error.sqlMessage || error.message || "");
        if (match && columns.includes(match[1])) {
          columns = columns.filter((column) => column !== match[1]);
          continue;
        }
      }
      throw error;
    }
  }
};

const findPaymentByTransactionId = async (transactionId) => {
  const [rows] = await pool.query(
    "SELECT * FROM payments WHERE transaction_id = ? LIMIT 1",
    [transactionId],
  );
  return rows[0] || null;
};

const updatePaymentStatus = async (transactionId, status) => {
  await pool.query(
    "UPDATE payments SET status = ? WHERE transaction_id = ?",
    [status, transactionId],
  );
};

const findStaffById = async (staffId) => {
  const [rows] = await pool.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    [staffId],
  );
  return rows[0] || null;
};

const findEmployeeById = async (employeeId) => {
  const [rows] = await pool.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    [employeeId],
  );
  return rows[0] || null;
};

const findServicesByIds = async (serviceIds) => {
  if (!serviceIds || !serviceIds.length) return [];
  const placeholders = serviceIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT * FROM services WHERE service_id IN (${placeholders})`,
    serviceIds,
  );
  return rows;
};

const getActiveEmployees = async () => {
  const [rows] = await pool.query(
    `SELECT
      employee_id,
      first_name,
      last_name,
      phone,
      email,
      specialization,
      hire_date,
      status
     FROM employees
     WHERE status = 'Active'
     ORDER BY first_name, last_name`,
  );
  return rows;
};

const getAllAppointments = async () => {
  const [rows] = await pool.query(
    `SELECT
      ca.appointment_id AS id,
      ca.customer_id AS user_id,
      c.email AS user_email,
      c.first_name AS user_name,
      ca.employee_id AS staff_id,
      CONCAT(e.first_name, ' ', e.last_name) AS staff_name,
      ca.status,
      ca.appointment_date,
      ca.appointment_time,
      ca.notes,
      ca.created_at,
      ca.service_id
    FROM client_appointments ca
    LEFT JOIN customers c ON ca.customer_id = c.customer_id
    LEFT JOIN employees e ON ca.employee_id = e.employee_id
    ORDER BY ca.appointment_date DESC, ca.appointment_time DESC`,
  );

  return Promise.all(
    rows.map(async (appointment) => {
      const [services] = await pool.query(
        `SELECT s.service_id AS id, s.title, s.price, s.duration_minutes
         FROM services s
         WHERE s.service_id = ?`,
        [appointment.service_id],
      );
      const [payments] = await pool.query(
        "SELECT * FROM payments WHERE appointment_id = ?",
        [appointment.id],
      );
      return { ...appointment, services: services || [], payments: payments || [] };
    }),
  );
};

module.exports = {
  createAppointment,
  addAppointmentServices,
  updateAppointmentStatus,
  getAppointmentDetails,
  getAppointmentsByUser,
  createPayment,
  findStaffById,
  findEmployeeById,
  findServicesByIds,
  getActiveEmployees,
  assignEmployeeToAppointment,
  getAllAppointments,
};