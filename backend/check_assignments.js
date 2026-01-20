const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Checking project assignments...");
db.all(`
    SELECT p.id, p.name, p.site_manager_id, u.username as manager_username 
    FROM projects p
    LEFT JOIN users u ON p.site_manager_id = u.id
`, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }
    db.close();
});
