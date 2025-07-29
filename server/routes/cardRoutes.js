const express = require('express');
const sqlite3 = require('sqlite3');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

const db = new sqlite3.Database('./database/bank.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
});

router.get('/', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM credit_cards', [], (err, rows) => {
        if (err) return next(new AppError('Error fetching cards', 400));
        res.json({ message: "success", data: rows });
    });
}));

router.post('/', catchAsync(async (req, res, next) => {
    const { name, bank, card_limit, balance, due_date, interest_rate } = req.body;
    const sql = 'INSERT INTO credit_cards (name, bank, card_limit, balance, due_date, interest_rate) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [name, bank, card_limit, balance, due_date, interest_rate], function(err) {
        if (err) return next(new AppError('Error creating card', 400));
        res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
    });
}));

router.put('/:id', catchAsync(async (req, res, next) => {
    const { name, bank, card_limit, balance, due_date, interest_rate } = req.body;
    const sql = 'UPDATE credit_cards SET name = ?, bank = ?, card_limit = ?, balance = ?, due_date = ?, interest_rate = ? WHERE id = ?';
    db.run(sql, [name, bank, card_limit, balance, due_date, interest_rate, req.params.id], function(err) {
        if (err) return next(new AppError('Error updating card', 400));
        res.json({ message: "success", data: { id: req.params.id, ...req.body } });
    });
}));

router.delete('/:id', catchAsync(async (req, res, next) => {
    const sql = 'DELETE FROM credit_cards WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) return next(new AppError('Error deleting card', 400));
        res.json({ message: "deleted", changes: this.changes });
    });
}));

module.exports = router; 