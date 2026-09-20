import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'urbanserve_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Azure
  azure: {
    storage: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'urbanserve-files',
    },
    keyVault: {
      uri: process.env.AZURE_KEY_VAULT_URI || '',
    },
    openai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
    },
    maps: {
      subscriptionKey: process.env.AZURE_MAPS_SUBSCRIPTION_KEY || '',
    },
  },
  
  // Payment
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'RAZORPAY',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    },
  },
  
  // Notifications
  notifications: {
    email: {
      service: process.env.EMAIL_SERVICE || '',
      apiKey: process.env.EMAIL_API_KEY || '',
    },
    sms: {
      service: process.env.SMS_SERVICE || '',
      apiKey: process.env.SMS_API_KEY || '',
    },
  },
  
  // Quick Service
  quickService: {
    responseWindowMinutes: parseInt(process.env.QUICK_SERVICE_RESPONSE_WINDOW_MINUTES || '5'),
    searchRadiusKm: parseInt(process.env.QUICK_SERVICE_SEARCH_RADIUS_KM || '10'),
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};

export default config;
