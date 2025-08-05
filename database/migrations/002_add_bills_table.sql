-- Bills Table
CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE
); 