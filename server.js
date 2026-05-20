const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { validateEnv } = require('./src/config/env');
const logger = require('./src/utils/logger');
const { initQueues } = require('./src/jobs/queue');


// Validate environment variables on startup
validateEnv();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MySQL
    await connectDB();
    logger.info('MySQL connected successfully');

    // Initialize BullMQ queues
    //initQueues();
    //logger.info('Job queues initialized');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
