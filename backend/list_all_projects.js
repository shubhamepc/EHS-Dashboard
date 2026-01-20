const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name FROM projects ORDER BY name", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Current Projects:");
        rows.forEach(r => console.log(`${r.id}: ${r.name}`));
    }
    db.close();
});
