const { emailQueue } = require('../queue');
const logger = require('../../utils/logger');

// Runs every day at midnight — cleans up old completed/failed jobs
const startCleanupScheduler = async () => {
  setInterval(async () => {
    try {
      await emailQueue.clean(24 * 60 * 60 * 1000, 100, 'completed');
      await emailQueue.clean(24 * 60 * 60 * 1000, 100, 'failed');
      logger.info('Queue cleanup completed');
    } catch (err) {
      logger.error('Queue cleanup error:', err);
    }
  }, 24 * 60 * 60 * 1000); // every 24 hours
};

module.exports = { startCleanupScheduler };
