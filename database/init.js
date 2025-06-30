const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to database
const dbPath = path.join(__dirname, 'bankme.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
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
        // Create tables
        db.run(createCardsTable, (err) => {
            if (err) {
                console.error('Error creating credit_cards table:', err.message);
            } else {
                console.log('✓ Credit cards table created');
            }
        });

        db.run(createTransactionsTable, (err) => {
            if (err) {
                console.error('Error creating transactions table:', err.message);
            } else {
                console.log('✓ Transactions table created');
            }
        });

        db.run(createPaymentsTable, (err) => {
            if (err) {
                console.error('Error creating payments table:', err.message);
            } else {
                console.log('✓ Payments table created');
            }
        });

        // Add sample data
        addSampleData();
    });
}

// Add sample credit cards for demonstration
function addSampleData() {
    // Check if sample data already exists
    db.get('SELECT COUNT(*) as count FROM credit_cards', [], (err, row) => {
        if (err) {
            console.error('Error checking existing data:', err.message);
            return;
        }

        if (row.count > 0) {
            console.log('Sample data already exists, skipping...');
            finish();
            return;
        }

        const sampleCards = [
            {
                card_name: 'Chase Freedom',
                bank_name: 'Chase Bank',
                credit_limit: 5000,
                current_balance: 1250.50,
                due_date: '2024-02-15',
                interest_rate: 18.99
            },
            {
                card_name: 'Amex Gold',
                bank_name: 'American Express',
                credit_limit: 10000,
                current_balance: 3200.75,
                due_date: '2024-02-20',
                interest_rate: 16.99
            },
            {
                card_name: 'Discover It',
                bank_name: 'Discover Bank',
                credit_limit: 3000,
                current_balance: 450.25,
                due_date: '2024-02-25',
                interest_rate: 19.99
            }
        ];

        const insertCard = db.prepare(`
            INSERT INTO credit_cards (card_name, bank_name, credit_limit, current_balance, due_date, interest_rate)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        sampleCards.forEach(card => {
            insertCard.run([
                card.card_name,
                card.bank_name,
                card.credit_limit,
                card.current_balance,
                card.due_date,
                card.interest_rate
            ], function(err) {
                if (err) {
                    console.error('Error inserting sample card:', err.message);
                } else {
                    console.log(`✓ Added sample card: ${card.card_name}`);
                }
            });
        });

        insertCard.finalize(() => {
            console.log('\n🎉 Database initialized successfully!');
            console.log('Sample credit cards have been added for demonstration.');
            finish();
        });
    });
}

function finish() {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        console.log('\nYou can now start the server with: npm run dev');
        process.exit(0);
    });
}

// Run initialization
console.log('Initializing BankMe database...\n');
initDatabase(); 