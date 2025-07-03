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
            due_date TEXT NOT NULL,
            interest_rate REAL NOT NULL,
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

    db.serialize(() => {
        db.run(createCardsTable);
        db.run(createTransactionsTable);
        db.run(createPaymentsTable);
        console.log('Database tables initialized');
        
        // Check if we need to add sample data
        db.get("SELECT COUNT(*) as count FROM credit_cards", (err, row) => {
            if (err) {
                console.error('Error checking credit_cards count:', err.message);
            } else if (row.count === 0) {
                insertSampleData();
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
            due_date: '2024-02-15',
            interest_rate: 18.99
        },
        {
            card_name: 'Bank of America Travel Rewards',
            bank_name: 'Bank of America',
            last4: '5678',
            credit_limit: 8000,
            current_balance: 1200,
            due_date: '2024-02-20',
            interest_rate: 16.99
        },
        {
            card_name: 'Bank of America Cash Rewards',
            bank_name: 'Bank of America',
            last4: '9012',
            credit_limit: 6000,
            current_balance: 800,
            due_date: '2024-02-25',
            interest_rate: 15.99
        },
        {
            card_name: 'American Express Gold Card',
            bank_name: 'American Express',
            last4: '3456',
            credit_limit: 15000,
            current_balance: 4500,
            due_date: '2024-02-10',
            interest_rate: 19.99
        }
    ];

    const stmt = db.prepare(`INSERT INTO credit_cards 
        (card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

    sampleCards.forEach(card => {
        stmt.run([
            card.card_name,
            card.bank_name,
            card.last4,
            card.credit_limit,
            card.current_balance,
            card.due_date,
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
    const { card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate } = req.body;
    // Get max position
    db.get('SELECT MAX(position) as maxPos FROM credit_cards', [], (err, row) => {
        const nextPos = (row && row.maxPos !== null) ? row.maxPos + 1 : 0;
        const sql = `
            INSERT INTO credit_cards (card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate, position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate, nextPos], function(err) {
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
    const { card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate } = req.body;
    const { id } = req.params;
    
    const sql = `
        UPDATE credit_cards 
        SET card_name = ?, bank_name = ?, last4 = ?, credit_limit = ?, current_balance = ?, 
            due_date = ?, interest_rate = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [card_name, bank_name, last4, credit_limit, current_balance, due_date, interest_rate, id], function(err) {
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
    const sql = `
        SELECT * FROM credit_cards 
        WHERE date(due_date) BETWEEN date('now') AND date('now', '+7 days')
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