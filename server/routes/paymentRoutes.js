const express = require('express');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const db = require('../db');

const router = express.Router();

router.get(
    '/',
    catchAsync(async (req, res, next) => {
        db.all('SELECT * FROM payments ORDER BY date DESC', [], (err, rows) => {
            if (err) return next(new AppError('Error fetching payments', 400));
            return res.json({ message: "success", data: rows });
        });
    })
);

router.post(
    '/',
    catchAsync(async (req, res, next) => {
        const { card_id: cardId, amount, date } = req.body;
        const sql =
            'INSERT INTO payments (card_id, amount, date) VALUES (?, ?, ?)';
        db.run(sql, [cardId, amount, date], function (err) {
            if (err) return next(new AppError('Error creating payment', 400));
            return res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
        });
    })
);

module.exports = router;
