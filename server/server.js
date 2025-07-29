const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');

const cardRoutes = require('./routes/cardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.use('/api/cards', cardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(port, () => {
    console.log(`BankMe server listening at http://localhost:${port}`);
});

module.exports = server; 