const requiredEnvVars = [
  'NODE_ENV',
  'PORT',

  // LOCAL DB
  'LOCAL_DB_HOST',
  'LOCAL_DB_USER',
  'LOCAL_DB_PASSWORD',
  'LOCAL_DB_NAME',

  // RAILWAY DB
  'RAILWAY_DB_HOST',
  'RAILWAY_DB_USER',
  'RAILWAY_DB_PASSWORD',
  'RAILWAY_DB_NAME',

  // JWT
  'JWT_SECRET',
  'JWT_EXPIRES_IN',

  // REDIS
  'REDIS_HOST',
  'REDIS_TOKEN',

  // MAIL
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASS',
  'MAIL_FROM',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

module.exports = { validateEnv };