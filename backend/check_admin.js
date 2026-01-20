const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, username, role, full_name, status FROM users", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
