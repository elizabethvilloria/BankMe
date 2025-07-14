const db = require('../../database/config');

const getAllCards = (req, res) => {
    const sql =
        'SELECT * FROM credit_cards ORDER BY position ASC, created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

const createCard = (req, res) => {
    const {
        card_name,
        bank_name,
        last4,
        credit_limit,
        current_balance,
        due_day,
        interest_rate,
        minimum_due,
    } = req.body;
    db.get(
        'SELECT MAX(position) as maxPos FROM credit_cards',
        [],
        (err, row) => {
            const nextPos = row && row.maxPos !== null ? row.maxPos + 1 : 0;
            const sql = `
            INSERT INTO credit_cards (card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due, position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
            db.run(
                sql,
                [
                    card_name,
                    bank_name,
                    last4,
                    credit_limit,
                    current_balance,
                    due_day,
                    interest_rate,
                    minimum_due || 25,
                    nextPos,
                ],
                function (err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    db.get(
                        'SELECT * FROM credit_cards WHERE id = ?',
                        [this.lastID],
                        (err, row) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            res.status(201).json(row);
                        }
                    );
                }
            );
        }
    );
};

const updateCard = (req, res) => {
    const {
        card_name,
        bank_name,
        last4,
        credit_limit,
        current_balance,
        due_day,
        interest_rate,
        minimum_due,
    } = req.body;
    const { id } = req.params;
    const sql = `
        UPDATE credit_cards 
        SET card_name = ?, bank_name = ?, last4 = ?, credit_limit = ?, current_balance = ?, 
            due_day = ?, interest_rate = ?, minimum_due = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    db.run(
        sql,
        [
            card_name,
            bank_name,
            last4,
            credit_limit,
            current_balance,
            due_day,
            interest_rate,
            minimum_due || 25,
            id,
        ],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Card not found' });
                return;
            }
            res.json({ message: 'Card updated successfully' });
        }
    );
};

const deleteCard = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM credit_cards WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Card not found' });
            return;
        }
        res.json({ message: 'Card deleted successfully' });
    });
};

const updateCardOrder = (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Order must be an array' });
    }
    const stmt = db.prepare(
        'UPDATE credit_cards SET position = ? WHERE id = ?'
    );
    order.forEach((item) => {
        stmt.run(item.position, item.id);
    });
    stmt.finalize((err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Order updated' });
        }
    });
};

module.exports = {
    getAllCards,
    createCard,
    updateCard,
    deleteCard,
    updateCardOrder,
};
