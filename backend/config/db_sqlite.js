const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database file
const dbPath = path.resolve(__dirname, '../ehs.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys
        db.run("PRAGMA foreign_keys = ON");
    }
});

// Wrapper to match PG interface
const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        // Convert PG style $1, $2 to SQLite ?
        const sqliteQuery = text.replace(/\$\d+/g, '?');

        // Detect query type
        const trimmedQuery = sqliteQuery.trim().toLowerCase();
        const isSelect = trimmedQuery.startsWith('select');
        const hasReturning = trimmedQuery.includes('returning');

        if (isSelect || hasReturning) {
            // For SELECT or INSERT/UPDATE ... RETURNING, we use db.all
            // Note: SQLite support for RETURNING is version dependent (3.35+). 
            // If the environment's sqlite version is old, this might fail, but it's the correct way to handle it if supported.
            db.all(sqliteQuery, params, (err, rows) => {
                if (err) {
                    console.error('Query Error:', err.message, sqliteQuery, params);
                    return reject(err);
                }
                resolve({ rows: rows, rowCount: rows.length });
            });
        } else {
            // Run for Insert/Update/Delete without RETURNING
            db.run(sqliteQuery, params, function (err) {
                if (err) {
                    console.error('Query Error:', err.message, sqliteQuery, params);
                    return reject(err);
                }
                resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
            });
        }
    });
};

module.exports = {
    query,
    db
};
