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
            credit_limit REAL NOT NULL,
            current_balance REAL NOT NULL,
            due_date TEXT NOT NULL,
            interest_rate REAL NOT NULL,
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
    });
}

// API Routes

// Get all credit cards
app.get('/api/cards', (req, res) => {
    const sql = 'SELECT * FROM credit_cards ORDER BY created_at DESC';
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
    const { card_name, bank_name, credit_limit, current_balance, due_date, interest_rate } = req.body;
    
    const sql = `
        INSERT INTO credit_cards (card_name, bank_name, credit_limit, current_balance, due_date, interest_rate)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [card_name, bank_name, credit_limit, current_balance, due_date, interest_rate], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get the newly created card
        db.get('SELECT * FROM credit_cards WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json(row);
        });
    });
});

// Update credit card
app.put('/api/cards/:id', (req, res) => {
    const { card_name, bank_name, credit_limit, current_balance, due_date, interest_rate } = req.body;
    const { id } = req.params;
    
    const sql = `
        UPDATE credit_cards 
        SET card_name = ?, bank_name = ?, credit_limit = ?, current_balance = ?, 
            due_date = ?, interest_rate = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [card_name, bank_name, credit_limit, current_balance, due_date, interest_rate, id], function(err) {
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