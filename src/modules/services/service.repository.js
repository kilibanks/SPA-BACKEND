const { pool } = require("../../config/db");

const getAllServices = async () => {
  const [services] = await pool.query(
    `SELECT 
      s.service_id AS id,
      s.title, 
      s.service_name,
      s.description, 
      s.price, 
      s.duration_minutes,
      s.status,
      s.category_id,
      s.created_at,
      c.name as category_name,
      c.description as category_description
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.category_id
    ORDER BY s.created_at DESC`,
  );
  
  // Fetch images for each service
  for (let service of services) {
    const [images] = await pool.query(
      `SELECT image_url, is_primary FROM service_images WHERE service_id = ? ORDER BY is_primary DESC`,
      [service.id]
    );
    service.images = images.map(img => img.image_url);
  }
  
  return services;
};

const getAvailableServices = async () => {
  const [services] = await pool.query(
    `SELECT 
      s.service_id AS id,
      s.title, 
      s.service_name,
      s.description, 
      s.price, 
      s.duration_minutes,
      s.status,
      s.category_id,
      s.created_at,
      c.name as category_name,
      c.description as category_description
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.category_id
    WHERE s.status = 'Available'
    ORDER BY s.created_at DESC`,
  );
  
  // Fetch images for each service
  for (let service of services) {
    const [images] = await pool.query(
      `SELECT image_url, is_primary FROM service_images WHERE service_id = ? ORDER BY is_primary DESC`,
      [service.id]
    );
    service.images = images.map(img => img.image_url);
  }
  
  return services;
};

const getServiceById = async (id) => {
  const [services] = await pool.query(
    `SELECT 
      s.service_id AS id,
      s.title, 
      s.service_name,
      s.description, 
      s.price, 
      s.duration_minutes,
      s.status,
      s.category_id,
      s.created_at,
      c.name as category_name,
      c.description as category_description
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.category_id
    WHERE s.service_id = ?`,
    [id],
  );
  
  if (!services[0]) return null;
  
  const [images] = await pool.query(
    `SELECT image_url, is_primary FROM service_images WHERE service_id = ? ORDER BY is_primary DESC`,
    [id]
  );
  services[0].images = images.map(img => img.image_url);
  
  return services[0];
};

const createService = async ({
  title,
  service_name,
  description,
  price,
  duration_minutes,
  status = 'Available',
  category_id = null,
}) => {
  const [result] = await pool.query(
    `INSERT INTO services 
    (title, service_name, description, price, duration_minutes, status, category_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, service_name, description, price, duration_minutes, status, category_id],
  );
  return getServiceById(result.insertId);
};

const updateService = async (id, {
  title,
  service_name,
  description,
  price,
  duration_minutes,
  status,
  category_id,
}) => {
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (service_name !== undefined) {
    updates.push("service_name = ?");
    values.push(service_name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (price !== undefined) {
    updates.push("price = ?");
    values.push(price);
  }
  if (duration_minutes !== undefined) {
    updates.push("duration_minutes = ?");
    values.push(duration_minutes);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }
  if (category_id !== undefined) {
    updates.push("category_id = ?");
    values.push(category_id);
  }

  if (updates.length === 0) {
    return getServiceById(id);
  }

  values.push(id);
  await pool.query(
    `UPDATE services SET ${updates.join(", ")} WHERE service_id = ?`,
    values,
  );
  return getServiceById(id);
};

const deleteService = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM services WHERE service_id = ?",
    [id],
  );
  return result.affectedRows > 0;
};

const getServicesByCategory = async (categoryId) => {
  const [services] = await pool.query(
    `SELECT 
      s.service_id AS id,
      s.title, 
      s.service_name,
      s.description, 
      s.price, 
      s.duration_minutes,
      s.status,
      s.category_id,
      s.created_at,
      c.name as category_name,
      c.description as category_description
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.category_id
    WHERE s.category_id = ? AND s.status = 'Available'
    ORDER BY s.created_at DESC`,
    [categoryId],
  );
  
  // Fetch images for each service
  for (let service of services) {
    const [images] = await pool.query(
      `SELECT image_url, is_primary FROM service_images WHERE service_id = ? ORDER BY is_primary DESC`,
      [service.id]
    );
    service.images = images.map(img => img.image_url);
  }
  
  return services;
};

module.exports = {
  getAllServices,
  getAvailableServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
};