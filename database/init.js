const db = require('./config');

const initDatabase = () => {
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
        db.run(createCardsTable);
        db.run(createTransactionsTable);
        db.run(createPaymentsTable);
        db.run(createBillsTable, () => {
            console.log('Database tables initialized');
            checkAndInsertSampleData();
        });
    });
};

const checkAndInsertSampleData = () => {
    db.get("SELECT COUNT(*) as count FROM credit_cards", (err, row) => {
        if (err) {
            console.error('Error checking credit_cards count:', err.message);
            return;
        }
        if (row.count === 0) {
            insertSampleData();
        }
    });

    db.get("SELECT COUNT(*) as count FROM bills", (err, row) => {
        if (err) {
            console.error('Error checking bills count:', err.message);
            return;
        }
        if (row.count === 0) {
            insertSampleBills();
        }
    });
};

const insertSampleData = () => {
    const sampleCards = [
        { name: 'Chase Sapphire Preferred', bank: 'Chase Bank', last4: '1234', limit: 10000, balance: 2500, dueDay: 15, interest: 18.99 },
        { name: 'Bank of America Travel Rewards', bank: 'Bank of America', last4: '5678', limit: 8000, balance: 1200, dueDay: 20, interest: 16.99 },
    ];

    const stmt = db.prepare(`INSERT INTO credit_cards 
        (card_name, bank_name, last4, credit_limit, current_balance, due_day, interest_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

    sampleCards.forEach(card => {
        stmt.run(card.name, card.bank, card.last4, card.limit, card.balance, card.dueDay, card.interest);
    });

    stmt.finalize(() => {
        console.log('Sample credit cards added.');
    });
};

const insertSampleBills = () => {
    const sampleBills = [
        { name: 'Electric Bill', amount: 85.50, dueDate: '2024-02-15', category: 'Utilities', paid: 0, notes: 'Monthly electricity bill' },
        { name: 'Netflix Subscription', amount: 15.99, dueDate: '2024-02-20', category: 'Entertainment', paid: 0, notes: 'Monthly streaming subscription' },
    ];

    const stmt = db.prepare(`INSERT INTO bills 
        (name, amount, due_date, category, is_paid, notes) 
        VALUES (?, ?, ?, ?, ?, ?)`);

    sampleBills.forEach(bill => {
        stmt.run(bill.name, bill.amount, bill.dueDate, bill.category, bill.paid, bill.notes);
    });

    stmt.finalize(() => {
        console.log('Sample bills added.');
    });
};

module.exports = initDatabase;
