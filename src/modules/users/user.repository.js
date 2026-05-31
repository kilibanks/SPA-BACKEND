const { pool } = require('../../config/db');

// ✅ FIND BY EMAIL (check BOTH tables)



// ✅ CHECK CUSTOMER DUPLICATES
const findCustomerByEmailOrPhone = async (email, phone) => {
  const [rows] = await pool.query(
    `SELECT * FROM customers WHERE email = ? OR phone = ?`,
    [email, phone]
  );
  return rows;
};


// CREATE TEMP USER (for email verification before final creation in customers/suppliers)
const createTempUser = async (data) => {
  const [result] = await pool.query(
    `
    INSERT INTO temp_users (
      user_type,
      first_name,
      last_name,
      supplier_name,
      contact_person,
      phone,
      email,
      gender,
      hashed_password,
      email_verification_code,
      phone_verification_code,
      email_code_expires_at,
      phone_code_expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.user_type,
      data.first_name,
      data.last_name,
      data.supplier_name,
      data.contact_person,
      data.phone,
      data.email,
      data.gender,
      data.hashed_password,
      data.email_verification_code,
      data.phone_verification_code,
      data.email_code_expires_at,
      data.phone_code_expires_at
    ]
  );

  return {
    temp_user_id: result.insertId,
    ...data
  };
};


// ✅ FIND TEMP USER BY EMAIL
const findTempUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT * FROM temp_users WHERE email = ?`,
    [email]
  );

  return rows[0] || null;
};


//DELETE TEMP USER (after successful verification and creation in main table)
const deleteTempUser = async (tempUserId) => {
  await pool.query(
    `DELETE FROM temp_users WHERE temp_user_id = ?`,
    [tempUserId]
  );
};



// ✅ CHECK SUPPLIER DUPLICATES
const findSupplierByEmailOrPhone = async (email, phone) => {
  const [rows] = await pool.query(
    `SELECT * FROM suppliers WHERE email = ? OR phone = ?`,
    [email, phone]
  );
  return rows;
};


const updateTempUserEmailCode = async (tempUserId, { email_verification_code, email_code_expires_at }) => {
  const [rows] = await pool.query(
    `UPDATE temp_users
     SET email_verification_code = ?, email_code_expires_at = ?
     WHERE temp_user_id = ?`,
    [email_verification_code, email_code_expires_at, tempUserId]
  );
  return rows;
};



// ✅ CREATE CUSTOMER
const createCustomer = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO customers 
    (first_name, last_name, phone, email, gender, hashed_password)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.first_name,
      data.last_name,
      data.phone,
      data.email,
      data.gender,
      data.hashed_password
    ]
  );

  return { customer_id: result.insertId, ...data };
};

// ✅ CREATE SUPPLIER
const createSupplier = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO suppliers 
    (supplier_name, contact_person, phone, email, address, hashed_password)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.supplier_name,
      data.contact_person,
      data.phone,
      data.email,
      data.address,
      data.hashed_password
    ]
  );

  return { supplier_id: result.insertId, ...data };
};


const findRolesByEmail = async (email) => {
  const roles = [];

  const [admins] = await pool.query(
    "SELECT admin_id FROM admin WHERE email = ?",
    [email]
  );
  if (admins.length) roles.push("admin");

  const [suppliers] = await pool.query(
    "SELECT supplier_id FROM suppliers WHERE email = ?",
    [email]
  );
  if (suppliers.length) roles.push("supplier");

  const [customers] = await pool.query(
    "SELECT customer_id FROM customers WHERE email = ?",
    [email]
  );
  if (customers.length) roles.push("customer");

  return roles;
};


const findByEmailAndRole = async (email, role) => {
  if (role === "customer") {
    const [rows] = await pool.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  }

  if (role === "supplier") {
    const [rows] = await pool.query(
      "SELECT * FROM suppliers WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  }

  if (role === "admin") {
    const [rows] = await pool.query(
      "SELECT * FROM admin WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  }

  return null;
};

const findAllCustomers = async () => {
  const [rows] = await pool.query(
    `SELECT customer_id, first_name, last_name, phone, email, gender, date_of_birth, created_at
     FROM customers
     ORDER BY created_at DESC`
  );
  return rows;
};

const findTempUserByEmailAndType = async (email, userType) => {
  const [rows] = await pool.query(
    `SELECT * FROM temp_users WHERE email = ? AND user_type = ?`,
    [email, userType]
  );
  return rows[0];
};


//login code DB methods
const createLoginCode = async ({ email, role, code, expires_at }) => {
  // invalidate any existing unused codes for this email+role
  await pool.query(
    `UPDATE login_codes SET used = 1 WHERE email = ? AND role = ? AND used = 0`,
    [email, role]
  );

  const [result] = await pool.query(
    `INSERT INTO login_codes (email, role, code, expires_at) VALUES (?, ?, ?, ?)`,
    [email, role, code, expires_at]
  );
  return result;
};

const findLoginCode = async ({ email, role, code }) => {
  const [rows] = await pool.query(
    `SELECT * FROM login_codes
     WHERE email = ? AND role = ? AND code = ? AND used = 0
     ORDER BY created_at DESC LIMIT 1`,
    [email, role, code]
  );
  return rows[0] || null;
};

const markLoginCodeUsed = async (id) => {
  await pool.query(`UPDATE login_codes SET used = 1 WHERE id = ?`, [id]);
};

const countCustomers = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM customers`
  );
  return rows[0].count;
};

const countSuppliers = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM suppliers`
  );
  return rows[0].count;
};

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.email) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.password) {
    fields.push('password = ?');
    values.push(data.password);
  }

  if (fields.length === 0) {
    return await findById(id);
  }

  values.push(id);
  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return await findById(id);
};

const remove = async (id) => {
  await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
};

module.exports = {
  createCustomer,
  createSupplier,
  createTempUser,
  deleteTempUser,
  findTempUserByEmail,
  findCustomerByEmailOrPhone,
  findSupplierByEmailOrPhone,
  findRolesByEmail,
  findByEmailAndRole,
  findAllCustomers,
  updateTempUserEmailCode,
  findTempUserByEmailAndType,

  createLoginCode,
  findLoginCode,
  markLoginCodeUsed,
  countCustomers,
  countSuppliers,
  findAll,
  findById,
  update,
  remove,
};