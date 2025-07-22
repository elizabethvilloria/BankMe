const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

// API routes for credit cards
app.get('/api/cards', (req, res) => {
    db.all('SELECT * FROM credit_cards', [], (err, rows) => {
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

app.post('/api/cards', (req, res) => {
    const { name, bank, card_limit, balance, due_date, interest_rate } = req.body;
    const sql = 'INSERT INTO credit_cards (name, bank, card_limit, balance, due_date, interest_rate) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [name, bank, card_limit, balance, due_date, interest_rate], function(err) {
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

app.listen(port, () => {
    console.log(`BankMe server listening at http://localhost:${port}`);
}); 