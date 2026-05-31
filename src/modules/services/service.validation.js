const Joi = require("joi");

const createServiceSchema = Joi.object({
  title: Joi.string().required().max(255),
  service_name: Joi.string().max(100),
  description: Joi.string().allow(null, ""),
  price: Joi.number().required().positive(),
  duration_minutes: Joi.number().required().integer().positive(),
  status: Joi.string().valid("Available", "Unavailable"),
});

const updateServiceSchema = Joi.object({
  title: Joi.string().max(255),
  service_name: Joi.string().max(100),
  description: Joi.string().allow(null, ""),
  price: Joi.number().positive(),
  duration_minutes: Joi.number().integer().positive(),
  status: Joi.string().valid("Available", "Unavailable"),
}).min(1);

module.exports = {
  createServiceSchema,
  updateServiceSchema,
};
