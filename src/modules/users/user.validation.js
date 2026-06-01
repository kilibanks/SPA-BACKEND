const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
}).min(1);

const updateCustomerSchema = Joi.object({
  first_name: Joi.string().max(50),
  last_name: Joi.string().max(50),
  phone: Joi.string().max(20),
  email: Joi.string().email(),
  gender: Joi.string().valid('Male', 'Female', 'Other', 'Prefer not to say'),
  date_of_birth: Joi.date(),
}).min(1);

module.exports = { updateUserSchema, updateCustomerSchema };
