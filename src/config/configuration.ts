export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/security_agency',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  nightAllowanceRate: parseInt(process.env.NIGHT_ALLOWANCE_RATE || '100', 10),
  workingDaysPerMonth: parseInt(process.env.WORKING_DAYS_PER_MONTH || '26', 10),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
});
