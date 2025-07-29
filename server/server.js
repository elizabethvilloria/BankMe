const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./database/bank.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the BankMe database.');
});

const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// API routes for credit cards
app.get('/api/cards', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM credit_cards', [], (err, rows) => {
        if (err) {
            return next(new AppError('Error fetching cards', 400));
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
}));

app.post('/api/cards', catchAsync(async (req, res, next) => {
    const { name, bank, card_limit, balance, due_date, interest_rate } = req.body;
    const sql = 'INSERT INTO credit_cards (name, bank, card_limit, balance, due_date, interest_rate) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [name, bank, card_limit, balance, due_date, interest_rate], function(err) {
        if (err) {
            return next(new AppError('Error creating card', 400));
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
}));

app.put('/api/cards/:id', (req, res) => {
    const { name, bank, card_limit, balance, due_date, interest_rate } = req.body;
    const sql = 'UPDATE credit_cards SET name = ?, bank = ?, card_limit = ?, balance = ?, due_date = ?, interest_rate = ? WHERE id = ?';
    db.run(sql, [name, bank, card_limit, balance, due_date, interest_rate, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success", data: { id: req.params.id, ...req.body } });
    });
});

app.delete('/api/cards/:id', (req, res) => {
    const sql = 'DELETE FROM credit_cards WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// API routes for transactions
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/transactions', (req, res) => {
    const { card_id, description, amount, category, date } = req.body;
    const sql = 'INSERT INTO transactions (card_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [card_id, description, amount, category, date], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

// API routes for payments
app.get('/api/payments', (req, res) => {
    db.all('SELECT * FROM payments ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/payments', (req, res) => {
    const { card_id, amount, date } = req.body;
    const sql = 'INSERT INTO payments (card_id, amount, date) VALUES (?, ?, ?)';
    db.run(sql, [card_id, amount, date], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`BankMe server listening at http://localhost:${port}`);
}); 