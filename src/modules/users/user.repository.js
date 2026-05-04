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

// ✅ CHECK SUPPLIER DUPLICATES
const findSupplierByEmailOrPhone = async (email, phone) => {
  const [rows] = await pool.query(
    `SELECT * FROM suppliers WHERE email = ? OR phone = ?`,
    [email, phone]
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


module.exports = {
  createCustomer,
  createSupplier,
  findCustomerByEmailOrPhone,
  findSupplierByEmailOrPhone,
  findRolesByEmail,
  findByEmailAndRole
};