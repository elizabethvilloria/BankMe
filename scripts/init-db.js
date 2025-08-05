const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbFile = './database/bank.db';
const migrationsDir = './database/migrations';

if (fs.existsSync(dbFile)) {
    console.log('Database file already exists. Checking for new migrations...');
}

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)", (err) => {
        if (err) {
            console.error('Error creating migrations table:', err);
            return;
        }

        const migrationFiles = fs.readdirSync(migrationsDir).sort();
        db.all("SELECT name FROM migrations", (err, appliedMigrations) => {
            if (err) {
                console.error('Error fetching applied migrations:', err);
                return;
            }

            const applied = appliedMigrations.map(row => row.name);
            migrationFiles.forEach(file => {
                if (!applied.includes(file)) {
                    console.log(`Applying migration: ${file}`);
                    const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                    db.exec(migration, (err) => {
                        if (err) {
                            console.error(`Error applying migration ${file}:`, err);
                        } else {
                            db.run("INSERT INTO migrations (name) VALUES (?)", [file]);
                        }
                    });
                }
            });
        });
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Finished migrations and closed the database connection.');
}); 