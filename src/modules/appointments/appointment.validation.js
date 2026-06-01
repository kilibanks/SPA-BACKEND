const Joi = require("joi");

const createAppointmentSchema = Joi.object({
  service_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
  scheduled_at: Joi.string().isoDate().required(),
  notes: Joi.string().max(500).allow("").optional(),
});

const assignEmployeeSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "in_progress", "completed", "cancelled")
    .required(),
});

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string()
    .valid("card", "cash", "bank_transfer", "other", "mpesa")
    .required(),
  transaction_id: Joi.when("method", {
    is: "mpesa",
    then: Joi.forbidden(),
    otherwise: Joi.string().max(100).required(),
  }),
  phone_number: Joi.when("method", {
    is: "mpesa",
    then: Joi.string().max(30).required(),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = {
  createAppointmentSchema,
  updateStatusSchema,
  createPaymentSchema,
  assignEmployeeSchema,
};
