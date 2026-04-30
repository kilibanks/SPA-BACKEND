const { emailQueue } = require('../jobs/queue');

const sendWelcomeEmail = async (to, name) => {
  await emailQueue.add('welcome-email', {
    to,
    subject: 'Welcome!',
    html: `<h1>Hi ${name}, welcome aboard!</h1><p>We're glad to have you.</p>`,
  });
};

const sendPasswordResetEmail = async (to, resetLink) => {
  await emailQueue.add('password-reset', {
    to,
    subject: 'Password Reset Request',
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
