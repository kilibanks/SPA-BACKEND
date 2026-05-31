const sendMail = require("../config/mailer");

const sendWelcomeEmail = async (to, name, role) => {
  await sendMail({
    to,
    subject: "Welcome!",
    html: `<h1>Hi ${name}, welcome aboard!</h1><p>We're glad to have you as a ${role}.</p>`,
  });
};

const sendPasswordResetEmail = async (to, resetLink) => {
  await sendMail({
    to,
    subject: "Password Reset Request",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};

const sendAppointmentStatusEmail = async (to, name, appointment, status) => {
  const appointmentDate = new Date(appointment.scheduled_at).toLocaleString();
  await sendMail({
    to,
    subject: `Appointment ${status}`,
    html: `
      <h1>Hi ${name},</h1>
      <p>Your appointment is now <strong>${status}</strong>.</p>
      <p>Scheduled for: ${appointmentDate}</p>
      <p>Assigned staff: ${appointment.staff_name || "TBD"}</p>
      <p>Service:</p>
      <ul>
        ${appointment.services.map((svc) => `<li>${svc.title} (KES ${svc.price})</li>`).join("")}
      </ul>
      <p>Thank you for booking with us.</p>
    `,
  });
};

const sendVerificationEmail = async (to, code) => {
  await sendMail({
    to,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

const sendPaymentReceiptEmail = async (to, transactionId, amount) => {
  await sendMail({
    to,
    subject: "Payment Receipt",
    html: `
      <h2>Payment Successful</h2>
      <p>Your payment was received successfully.</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Amount:</strong> KES ${amount}</p>
      <p>Status: HELD (secured in escrow)</p>
      <p>Thank you for choosing us.</p>
    `,
  });
};


const sendAdminPaymentNotificationEmail = async (customerEmail, transactionId, amount) => {
  await sendMail({
    to: "walletvincent1@gmail.com",
    subject: "New Payment Received",
    html: `
      <h2>Payment Notification</h2>
      <p>A payment has been received from <strong>${customerEmail}</strong>.</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Amount:</strong> KES ${amount}</p>
      <p>Status: HELD (secured in escrow)</p>
    `,
  });
};

//2FA email function

const sendLoginCodeEmail = async (to, code, role) => {
  await sendMail({
    to,
    subject: "Your Login Verification Code",
    html: `
      <h2>Login Verification</h2>
      <p>You are logging in as <strong>${role.toUpperCase()}</strong>.</p>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 8px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not attempt to log in, please ignore this email.</p>
    `,
  });
};

// add to exports
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAppointmentStatusEmail,
  sendVerificationEmail,
  sendPaymentReceiptEmail,
  sendAdminPaymentNotificationEmail,
  sendLoginCodeEmail,
};