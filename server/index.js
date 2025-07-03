const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Database setup
const db = new sqlite3.Database('./database/bankme.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    const createCardsTable = `
        CREATE TABLE IF NOT EXISTS credit_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_name TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            last4 TEXT,
            credit_limit REAL NOT NULL,
            current_balance REAL NOT NULL,
            due_day INTEGER NOT NULL,
            interest_rate REAL NOT NULL,
            minimum_due REAL DEFAULT 25,
            position INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            transaction_date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES credit_cards (id)
        )
    `;

    const createPaymentsTable = `
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER,
            amount REAL NOT NULL,
            payment_date TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES credit_cards (id)
        )
    `;

    const createBillsTable = `
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            due_date TEXT NOT NULL,
            category TEXT NOT NULL,
            is_paid BOOLEAN DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.serialize(() => {
        // Migration: if due_date exists, extract day and add due_day
        db.get("PRAGMA table_info(credit_cards)", (err, info) => {
            db.all("PRAGMA table_info(credit_cards)", (err, columns) => {
                const hasDueDate = columns.some(col => col.name === 'due_date');
                const hasDueDay = columns.some(col => col.name === 'due_day');
                if (hasDueDate && !hasDueDay) {
                    db.run('ALTER TABLE credit_cards ADD COLUMN due_day INTEGER', () => {
                        db.all('SELECT id, due_date FROM credit_cards', (err, rows) => {
                            if (rows) {
                                rows.forEach(row => {
                                    if (row.due_date) {
                                        const day = parseInt(row.due_date.split('-')[2]);
                                        db.run('UPDATE credit_cards SET due_day = ? WHERE id = ?', [day, row.id]);
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
        db.run(createCardsTable);
        db.run(createTransactionsTable);
        db.run(createPaymentsTable);
        db.run(createBillsTable);
        console.log('Database tables initialized');
        
        // Check if we need to add sample data
        db.get("SELECT COUNT(*) as count FROM credit_cards", (err, row) => {
            if (err) {
                console.error('Error checking credit_cards count:', err.message);
            } else if (row.count === 0) {
                insertSampleData();
            }
        });

        // Check if we need to add sample bills
        db.get("SELECT COUNT(*) as count FROM bills", (err, row) => {
            if (err) {
                console.error('Error checking bills count:', err.message);
            } else if (row.count === 0) {
                insertSampleBills();
            }
        });
    });
}

function insertSampleData() {
    const sampleCards = [
        {
            card_name: 'Chase Sapphire Preferred',
            bank_name: 'Chase Bank',
            last4: '1234',
            credit_limit: 10000,
            current_balance: 2500,
            due_day: 15,
            interest_rate: 18.99
        },
        {
            card_name: 'Bank of America Travel Rewards',
            bank_name: 'Bank of America',
            last4: '5678',
            credit_limit: 8000,
            current_balance: 1200,
            due_day: 20,
            interest_rate: 16.99
        },
        {
            card_name: 'Bank of America Cash Rewards',
            bank_name: 'Bank of America',
            last4: '9012',
            credit_limit: 6000,
            current_balance: 800,
            due_day: 25,
            interest_rate: 15.99
        },
        {
            card_name: 'American Express Gold Card',
            bank_name: 'American Express',
            last4: '3456',
            credit_limit: 15000,
            current_balance: 4500,
            due_day: 10,
            interest_rate: 19.99
        }
    ];

    const stmt = db.prepare(`INSERT INTO credit_cards 
        (card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

    sampleCards.forEach(card => {
        stmt.run([
            card.card_name,
            card.bank_name,
            card.last4,
            card.credit_limit,
            card.current_balance,
            card.due_day,
            card.interest_rate
        ], (err) => {
            if (err) {
                console.error('Error inserting sample card:', err.message);
            }
        });
    });

    stmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing sample data insertion:', err.message);
        } else {
            console.log('Sample credit cards added to database');
        }
    });
}

function insertSampleBills() {
    const sampleBills = [
        {
            name: 'Electric Bill',
            amount: 85.50,
            due_date: '2024-02-15',
            category: 'Utilities',
            is_paid: 0,
            notes: 'Monthly electricity bill'
        },
        {
            name: 'Netflix Subscription',
            amount: 15.99,
            due_date: '2024-02-20',
            category: 'Entertainment',
            is_paid: 0,
            notes: 'Monthly streaming subscription'
        },
        {
            name: 'Car Insurance',
            amount: 120.00,
            due_date: '2024-02-25',
            category: 'Insurance',
            is_paid: 0,
            notes: 'Monthly car insurance premium'
        },
        {
            name: 'Phone Bill',
            amount: 65.00,
            due_date: '2024-03-01',
            category: 'Utilities',
            is_paid: 0,
            notes: 'Monthly phone service'
        }
    ];

    const stmt = db.prepare(`INSERT INTO bills 
        (name, amount, due_date, category, is_paid, notes) 
        VALUES (?, ?, ?, ?, ?, ?)`);

    sampleBills.forEach(bill => {
        stmt.run([
            bill.name,
            bill.amount,
            bill.due_date,
            bill.category,
            bill.is_paid,
            bill.notes
        ], (err) => {
            if (err) {
                console.error('Error inserting sample bill:', err.message);
            }
        });
    });

    stmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing sample bills insertion:', err.message);
        } else {
            console.log('Sample bills added to database');
        }
    });
}

// API Routes

// Get all credit cards
app.get('/api/cards', (req, res) => {
    const sql = 'SELECT * FROM credit_cards ORDER BY position ASC, created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new credit card
app.post('/api/cards', (req, res) => {
    const { card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due } = req.body;
    // Get max position
    db.get('SELECT MAX(position) as maxPos FROM credit_cards', [], (err, row) => {
        const nextPos = (row && row.maxPos !== null) ? row.maxPos + 1 : 0;
        const sql = `
            INSERT INTO credit_cards (card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due, position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due || 25, nextPos], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            db.get('SELECT * FROM credit_cards WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            });
        });
    });
});

// Update credit card
app.put('/api/cards/:id', (req, res) => {
    const { card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due } = req.body;
    const { id } = req.params;
    
    const sql = `
        UPDATE credit_cards 
        SET card_name = ?, bank_name = ?, last4 = ?, credit_limit = ?, current_balance = ?, 
            due_day = ?, interest_rate = ?, minimum_due = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate, minimum_due || 25, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Card not found' });
            return;
        }
        
        res.json({ message: 'Card updated successfully' });
    });
});

// Delete credit card
app.delete('/api/cards/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM credit_cards WHERE id = ?', [id], function(err) {
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
});

// Get dashboard summary
app.get('/api/dashboard', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_cards,
            SUM(credit_limit) as total_limit,
            SUM(current_balance) as total_balance,
            AVG(current_balance * 100.0 / credit_limit) as avg_utilization
        FROM credit_cards
    `;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const summary = {
            total_cards: row.total_cards || 0,
            total_limit: row.total_limit || 0,
            total_balance: row.total_balance || 0,
            avg_utilization: row.avg_utilization || 0
        };
        
        res.json(summary);
    });
});

// Get upcoming payments (due within 7 days)
app.get('/api/upcoming-payments', (req, res) => {
    // Get all cards and filter by upcoming due dates on the server side
    const sql = `SELECT * FROM credit_cards ORDER BY due_day ASC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Filter cards that are due within 7 days
        const today = new Date();
        const upcomingCards = rows.filter(card => {
            const nextDueDate = getNextDueDate(card.due_day);
            const diffTime = nextDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        });
        
        res.json(upcomingCards);
    });
});

// Helper function to calculate next due date
function getNextDueDate(dueDay) {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let nextDue = new Date(year, month, dueDay);
    if (nextDue < today) {
        // If this month's due date has passed, go to next month
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
        nextDue = new Date(year, month, dueDay);
    }
    return nextDue;
}

// Update card order
app.put('/api/cards/order', (req, res) => {
    const { order } = req.body; // order: [{id: 1, position: 0}, ...]
    if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Order must be an array' });
    }
    const stmt = db.prepare('UPDATE credit_cards SET position = ? WHERE id = ?');
    order.forEach(item => {
        stmt.run([item.position, item.id]);
    });
    stmt.finalize(err => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Order updated' });
        }
    });
});

// Bills API Routes

// Get all bills
app.get('/api/bills', (req, res) => {
    const sql = 'SELECT * FROM bills ORDER BY due_date ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new bill
app.post('/api/bills', (req, res) => {
    const { name, amount, due_date, category, notes } = req.body;
    
    const sql = `
        INSERT INTO bills (name, amount, due_date, category, notes)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [name, amount, due_date, category, notes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get the newly created bill
        db.get('SELECT * FROM bills WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json(row);
        });
    });
});

// Update bill
app.put('/api/bills/:id', (req, res) => {
    const { name, amount, due_date, category, is_paid, notes } = req.body;
    const { id } = req.params;
    
    const sql = `
        UPDATE bills 
        SET name = ?, amount = ?, due_date = ?, category = ?, is_paid = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [name, amount, due_date, category, is_paid, notes, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Bill not found' });
            return;
        }
        
        // Get the updated bill
        db.get('SELECT * FROM bills WHERE id = ?', [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row);
        });
    });
});

// Delete bill
app.delete('/api/bills/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM bills WHERE id = ?', [id], function(err) {
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
});

// Toggle bill paid status
app.patch('/api/bills/:id/toggle', (req, res) => {
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
        
        db.run('UPDATE bills SET is_paid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            db.get('SELECT * FROM bills WHERE id = ?', [id], (err, updatedRow) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json(updatedRow);
            });
        });
    });
});

// Get upcoming bills (due within 30 days)
app.get('/api/bills/upcoming', (req, res) => {
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
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`BankMe server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
}); 