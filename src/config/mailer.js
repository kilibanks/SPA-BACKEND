const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ← fixes self-signed cert error
  },
});

transporter.verify((error) => {
  if (error) console.error("Mail transporter error:", error);
  else console.log("Mail transporter ready");
});

module.exports = transporter;