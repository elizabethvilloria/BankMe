const express = require('express');
const sqlite3 = require('sqlite3');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

const db = new sqlite3.Database('./database/bank.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
});

router.get('/', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM bills ORDER BY due_date DESC', [], (err, rows) => {
        if (err) return next(new AppError('Error fetching bills', 400));
        return res.json({ message: "success", data: rows });
    });
}));

router.post('/', catchAsync(async (req, res, next) => {
    const { name, amount, due_date: dueDate } = req.body;
    const sql = 'INSERT INTO bills (name, amount, due_date) VALUES (?, ?, ?)';
    db.run(sql, [name, amount, dueDate], function (err) {
        if (err) return next(new AppError('Error creating bill', 400));
        return res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
    });
}));

router.patch('/:id', catchAsync(async (req, res, next) => {
    const { is_paid: isPaid } = req.body;
    const sql = 'UPDATE bills SET is_paid = ? WHERE id = ?';
    db.run(sql, [isPaid, req.params.id], function (err) {
        if (err) return next(new AppError('Error updating bill', 400));
        return res.json({ message: "success", data: { id: req.params.id, ...req.body } });
    });
}));

module.exports = router; 