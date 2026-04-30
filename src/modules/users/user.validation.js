const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
}).min(1);

module.exports = { updateUserSchema };
