require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey_replace_in_production_min32chars',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
};

if (!config.databaseUrl) {
    console.warn('WARNING: DATABASE_URL is not set in environment variables!');
}

module.exports = config;