const express = require('express');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Retrieve a list of credit cards
 *     responses:
 *       200:
 *         description: A list of cards.
 */
router.get('/', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM credit_cards', [], (err, rows) => {
        if (err) return next(new AppError('Error fetching cards', 400));
        return res.json({ message: "success", data: rows });
    });
}));

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new credit card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bank:
 *                 type: string
 *               card_limit:
 *                 type: number
 *               balance:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date
 *               interest_rate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', catchAsync(async (req, res, next) => {
    const {
      name, bank, card_limit: cardLimit, balance, due_date: dueDate, interest_rate: interestRate,
    } = req.body;
    if (!name || !bank || Number.isNaN(Number(cardLimit))) {
        return next(new AppError('Validation error: name, bank and card_limit are required', 400));
    }
    const sql = 'INSERT INTO credit_cards (name, bank, card_limit, balance, due_date, interest_rate) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [name, bank, cardLimit, balance ?? 0, dueDate, interestRate], function (err) {
        if (err) return next(new AppError('Error creating card', 400));
        return res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
    });
}));

router.put('/:id', catchAsync(async (req, res, next) => {
    const {
      name, bank, card_limit: cardLimit, balance, due_date: dueDate, interest_rate: interestRate,
    } = req.body;
    if (!name || !bank || Number.isNaN(Number(cardLimit))) {
        return next(new AppError('Validation error: name, bank and card_limit are required', 400));
    }
    const sql = 'UPDATE credit_cards SET name = ?, bank = ?, card_limit = ?, balance = ?, due_date = ?, interest_rate = ? WHERE id = ?';
    db.run(sql, [name, bank, cardLimit, balance ?? 0, dueDate, interestRate, req.params.id], (err) => {
        if (err) return next(new AppError('Error updating card', 400));
        return res.json({ message: "success", data: { id: req.params.id, ...req.body } });
    });
}));

router.delete('/:id', catchAsync(async (req, res, next) => {
    const sql = 'DELETE FROM credit_cards WHERE id = ?';
    db.run(sql, req.params.id, function (err) {
        if (err) return next(new AppError('Error deleting card', 400));
        return res.json({ message: "deleted", changes: this.changes });
    });
}));

module.exports = router;
