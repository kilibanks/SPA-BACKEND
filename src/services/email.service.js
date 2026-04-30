const { emailQueue } = require("../jobs/queue");

const sendWelcomeEmail = async (to, name) => {
  await emailQueue.add("welcome-email", {
    to,
    subject: "Welcome!",
    html: `<h1>Hi ${name}, welcome aboard!</h1><p>We're glad to have you.</p>`,
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

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAppointmentStatusEmail,
};
