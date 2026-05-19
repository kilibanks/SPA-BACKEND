// config/mailer.js
const nodemailer = require("nodemailer"); // ← was missing

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  socketTimeout: 10000,
  greetingTimeout: 10000,
  connectionTimeout: 10000,
});

module.exports = transporter;