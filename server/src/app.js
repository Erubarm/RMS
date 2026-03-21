require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { authMiddleware } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const expositionsRouter = require('./routes/expositions');
const excursionsRouter = require('./routes/excursions');
const bookingsRouter = require('./routes/bookings');
const eventsRouter = require('./routes/events');
const infoRouter = require('./routes/info');
const teacherRequestsRouter = require('./routes/teacherRequests');
const notificationsRouter = require('./routes/notifications');
const adminRouter = require('./routes/admin');
const { startCronJobs } = require('./services/cronService');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.use('/api/info', infoRouter);

// Admin routes used their own JWT auth (независимо от VK)
app.use('/api/admin', adminRouter);

// VK Auth middleware for mini-app routes
if (process.env.NODE_ENV === 'development') {
  const prisma = require('./prisma');
  app.use('/api', async (req, res, next) => {
    let user = await prisma.user.findUnique({ where: { vkId: 1 } });
    if (!user) {
      user = await prisma.user.create({
        data: { vkId: 1, firstName: 'Dev', lastName: 'User', role: 'ADMIN' },
      });
    }
    req.user = user;
    next();
  });
} else {
  app.use('/api', authMiddleware);
}

// Mini-app protected routes
app.use('/api/expositions', expositionsRouter);
app.use('/api/excursions', excursionsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/teacher-requests', teacherRequestsRouter);
app.use('/api/notifications', notificationsRouter);

// Error handler
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`RMI API server running on port ${PORT}`);
    startCronJobs();
  });
}
