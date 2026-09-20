import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Module Route Imports
import authRoutes from './modules/auth/auth.routes';
import servicesRoutes from './modules/services/services.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import quickServiceRoutes from './modules/quick-service/quick-service.routes';
import professionalsRoutes from './modules/professionals/professionals.routes';
import availabilityRoutes from './modules/availability/availability.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import disputesRoutes from './modules/disputes/disputes.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import usersRoutes from './modules/users/users.routes';
import adminRoutes from './modules/admin/admin.routes';
import aiRoutes from './modules/ai/ai.routes';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://urbanserve-delta.vercel.app',
    ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UrbanServe API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    modules: [
      'auth',
      'services',
      'bookings',
      'quick-service',
      'professionals',
      'availability',
      'payments',
      'reviews',
      'disputes',
      'notifications',
      'users',
      'admin',
      'ai',
    ],
  });
});

// API Routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/services`, servicesRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/quick-services`, quickServiceRoutes);
app.use(`${apiPrefix}/professionals`, professionalsRoutes);
app.use(`${apiPrefix}/availability`, availabilityRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/reviews`, reviewsRoutes);
app.use(`${apiPrefix}/disputes`, disputesRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 UrbanServe Backend Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📍 API Base URL: http://localhost:${PORT}${apiPrefix}`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
