const express = require('express');
require('dotenv').config();
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');
const setupSwagger = require('./swagger');
const logger = require('./middleware/logger');

const cardRoutes = require('./routes/cardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const billRoutes = require('./routes/billRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(logger);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.static('public'));
app.use(express.json());

setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/cards', cardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', billRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(port, () => {
    console.log(`BankMe server listening at http://localhost:${port}`);
});

module.exports = server;
