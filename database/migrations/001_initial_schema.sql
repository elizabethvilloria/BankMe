-- Credit Cards Table
CREATE TABLE credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    card_limit REAL NOT NULL,
    balance REAL DEFAULT 0,
    due_date TEXT,
    interest_rate REAL
);

-- Transactions Table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (card_id) REFERENCES credit_cards (id)
);

-- Payments Table
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Completed',
    FOREIGN KEY (card_id) REFERENCES credit_cards (id)
); 