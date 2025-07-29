const express = require('express');
const sqlite3 = require('sqlite3');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

const db = new sqlite3.Database('./database/bank.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
});

router.get('/', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
        if (err) return next(new AppError('Error fetching transactions', 400));
        res.json({ message: "success", data: rows });
    });
}));

router.post('/', catchAsync(async (req, res, next) => {
    const { card_id, description, amount, category, date } = req.body;
    const sql = 'INSERT INTO transactions (card_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [card_id, description, amount, category, date], function(err) {
        if (err) return next(new AppError('Error creating transaction', 400));
        res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
    });
}));

module.exports = router; 