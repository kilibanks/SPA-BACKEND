const express = require("express");
const cors = require('cors');

const app = express();
app.use(cors());

const paymentRoutes = require("./modules/payments/payment.routes");


const webhookRoutes = require("./services/webhook.routes");


app.use("/api/v1", webhookRoutes);


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");


app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/appointments", appointmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (must be last)
const errorMiddleware = require("./middlewares/error.middleware");
app.use(errorMiddleware);

module.exports = app;
