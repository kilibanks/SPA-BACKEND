const Joi = require("joi");

const createAppointmentSchema = Joi.object({
  staff_id: Joi.number().integer().positive().required(),
  service_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
  scheduled_at: Joi.string().isoDate().required(),
  notes: Joi.string().max(500).allow("").optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "in_progress", "completed", "cancelled")
    .required(),
});

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string()
    .valid("card", "cash", "bank_transfer", "other")
    .required(),
  transaction_id: Joi.string().max(100).required(),
});

module.exports = {
  createAppointmentSchema,
  updateStatusSchema,
  createPaymentSchema,
};
