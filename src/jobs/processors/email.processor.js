const transporter = require('../../config/mailer');
const logger = require('../../utils/logger');

const emailProcessor = async (job) => {
  const { to, subject, html } = job.data;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });

  logger.info(`Email sent to ${to} — Subject: ${subject}`);
};

module.exports = emailProcessor;
