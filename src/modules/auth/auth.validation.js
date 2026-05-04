const Joi = require('joi');

const registerSchema = Joi.object({
  role: Joi.string().valid("customer", "supplier").required(),

  firstName: Joi.string().required(),
  surname: Joi.string().allow(""),
  contact: Joi.string().allow(""),

  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),

  // ✅ Customer only
  gender: Joi.when("role", {
    is: "customer",
    then: Joi.string().valid("Male", "Female", "Other").required(),
    otherwise: Joi.forbidden()
  }),

  // ✅ Supplier only
  address: Joi.when("role", {
    is: "supplier",
    then: Joi.string().allow(null, ""),
    otherwise: Joi.forbidden()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("admin", "supplier", "customer").required(),
});

module.exports = { registerSchema, loginSchema };
