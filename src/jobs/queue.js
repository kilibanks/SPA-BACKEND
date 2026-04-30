const { Queue, Worker } = require('bullmq');
const logger = require('../utils/logger');

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// Define queues
const emailQueue = new Queue('email', { connection: redisConnection });

const initQueues = () => {
  const emailProcessor = require('./processors/email.processor');

  const emailWorker = new Worker('email', emailProcessor, { connection: redisConnection });

  emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed: ${err.message}`);
  });

  logger.info('Workers initialized');
};

module.exports = { emailQueue, initQueues };
