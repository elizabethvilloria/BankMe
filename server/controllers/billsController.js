const db = require('../../database/config');

const getAllBills = (req, res) => {
    const sql = 'SELECT * FROM bills ORDER BY due_date ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

const createBill = (req, res) => {
    const { name, amount, due_date, category, notes } = req.body;
    const sql = `
        INSERT INTO bills (name, amount, due_date, category, notes)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [name, amount, due_date, category, notes], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        db.get(
            'SELECT * FROM bills WHERE id = ?',
            [this.lastID],
            (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            }
        );
    });
};

const updateBill = (req, res) => {
    const { name, amount, due_date, category, is_paid, notes } = req.body;
    const { id } = req.params;
    const sql = `
        UPDATE bills 
        SET name = ?, amount = ?, due_date = ?, category = ?, is_paid = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    db.run(
        sql,
        [name, amount, due_date, category, is_paid, notes, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Bill not found' });
                return;
            }
            db.get('SELECT * FROM bills WHERE id = ?', [id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json(row);
            });
        }
    );
};

const deleteBill = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM bills WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Bill not found' });
            return;
        }
        res.json({ message: 'Bill deleted successfully' });
    });
};

const toggleBillPaid = (req, res) => {
    const { id } = req.params;
    db.get('SELECT is_paid FROM bills WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Bill not found' });
            return;
        }
        const newStatus = row.is_paid ? 0 : 1;
        db.run(
            'UPDATE bills SET is_paid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newStatus, id],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                db.get(
                    'SELECT * FROM bills WHERE id = ?',
                    [id],
                    (err, updatedRow) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json(updatedRow);
                    }
                );
            }
        );
    });
};

const getUpcomingBills = (req, res) => {
    const sql = `
        SELECT * FROM bills 
        WHERE date(due_date) BETWEEN date('now') AND date('now', '+30 days')
        AND is_paid = 0
        ORDER BY due_date ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

module.exports = {
    getAllBills,
    createBill,
    updateBill,
    deleteBill,
    toggleBillPaid,
    getUpcomingBills,
};
