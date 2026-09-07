export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:24302C0002@localhost:5432/backend',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_secret_key_agri_procure_jwt_access_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_secret_key_agri_procure_jwt_refresh_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: 1000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});
