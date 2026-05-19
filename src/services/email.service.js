const { emailQueue } = require("../jobs/queue");

const sendWelcomeEmail = async (to, name, role) => {
  await emailQueue.add("welcome-email", {
    to,
    subject: "Welcome!",
    html: `<h1>Hi ${name}, welcome aboard!</h1><p>We're glad to have you as a ${role}.</p>`,
  });
};

const sendPasswordResetEmail = async (to, resetLink) => {
  await emailQueue.add("password-reset", {
    to,
    subject: "Password Reset Request",
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  });
};

const sendAppointmentStatusEmail = async (to, name, appointment, status) => {
  const appointmentDate = new Date(appointment.scheduled_at).toLocaleString();
  await emailQueue.add("appointment-status", {
    to,
    subject: `Appointment ${status}`,
    html: `
      <h1>Hi ${name},</h1>
      <p>Your appointment is now <strong>${status}</strong>.</p>
      <p>Scheduled for: ${appointmentDate}</p>
      <p>Assigned staff: ${appointment.staff_name || "TBD"}</p>
      <p>Services:</p>
      <ul>
        ${appointment.services.map((svc) => `<li>${svc.title} (${svc.quantity} × $${svc.price})</li>`).join("")}
      </ul>
      <p>Thank you for booking with us.</p>
    `,
  });
};

const sendVerificationEmail = async (to, code) => {
  await emailQueue.add("verification-email", {
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


const sendPaymentReceiptEmail = async (
  to,
  transactionId,
  amount
) => {

  await emailQueue.add("payment-receipt", {
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



module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAppointmentStatusEmail,
  sendVerificationEmail,
  sendPaymentReceiptEmail,
};
