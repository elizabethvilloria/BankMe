const sqlite3 = require('sqlite3');

const dbPath = process.env.DB_PATH || './database/bank.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error(err.message);
});

module.exports = db; 