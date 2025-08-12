const express = require('express');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Retrieve a list of bills
 *     responses:
 *       200:
 *         description: A list of bills.
 */
router.get('/', catchAsync(async (req, res, next) => {
    db.all('SELECT * FROM bills ORDER BY due_date DESC', [], (err, rows) => {
        if (err) return next(new AppError('Error fetching bills', 400));
        return res.json({ message: "success", data: rows });
    });
}));

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a bill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               amount: { type: number }
 *               due_date: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', catchAsync(async (req, res, next) => {
    const { name, amount, due_date: dueDate } = req.body;
    const sql = 'INSERT INTO bills (name, amount, due_date) VALUES (?, ?, ?)';
    db.run(sql, [name, amount, dueDate], function (err) {
        if (err) return next(new AppError('Error creating bill', 400));
        return res.status(201).json({ message: "success", data: { id: this.lastID, ...req.body } });
    });
}));

/**
 * @swagger
 * /api/bills/{id}:
 *   patch:
 *     summary: Update bill paid status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', catchAsync(async (req, res, next) => {
    const { is_paid: isPaid } = req.body;
    const sql = 'UPDATE bills SET is_paid = ? WHERE id = ?';
    db.run(sql, [isPaid, req.params.id], function (err) {
        if (err) return next(new AppError('Error updating bill', 400));
        return res.json({ message: "success", data: { id: req.params.id, ...req.body } });
    });
}));

/**
 * @swagger
 * /api/bills/{id}:
 *   delete:
 *     summary: Delete a bill
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', catchAsync(async (req, res, next) => {
    const sql = 'DELETE FROM bills WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) return next(new AppError('Error deleting bill', 400));
        return res.json({ message: 'deleted', changes: this.changes });
    });
}));

module.exports = router; 