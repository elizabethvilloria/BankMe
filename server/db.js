const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/bank.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error(err.message);
});

module.exports = db; 