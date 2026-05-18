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

const findTempUserByEmailAndType = async (email, userType) => {
  const [rows] = await pool.query(
    `SELECT * FROM temp_users WHERE email = ? AND user_type = ?`,
    [email, userType]
  );
  return rows[0];
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
  updateTempUserEmailCode,
  findTempUserByEmailAndType,
};