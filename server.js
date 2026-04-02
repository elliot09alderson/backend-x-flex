const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const seedConfig = require('./config/seedConfig');
const errorHandler = require('./middleware/errorHandler');
const initCronJobs = require('./cron');

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/merchants', require('./routes/merchantRoutes'));
app.use('/api/promoters', require('./routes/promoterRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedConfig();
  initCronJobs();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
