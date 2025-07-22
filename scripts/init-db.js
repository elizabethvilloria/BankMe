const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './database/bank.db';
const schemaFile = './database/schema.sql';

// Check if the database file already exists
if (fs.existsSync(dbFile)) {
    console.log('Database file already exists. Skipping initialization.');
    return;
}

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the new SQLite database.');
});

const schema = fs.readFileSync(schemaFile, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Database schema created successfully.');
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
}); 