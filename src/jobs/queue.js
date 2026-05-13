const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../utils/logger');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

connection.on('connect', () => {
  logger.info('Redis connected');
});

connection.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

// Define queues
const emailQueue = new Queue('email', {
  connection,
});

const initQueues = () => {
  const emailProcessor = require('./processors/email.processor');

  const emailWorker = new Worker(
    'email',
    emailProcessor,
    {
      connection,
    }
  );

  emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed: ${err.message}`);
  });

  logger.info('Workers initialized');
};

module.exports = { emailQueue, initQueues };