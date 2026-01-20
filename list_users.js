const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/ehs.sqlite');

db.serialize(() => {
    db.all("SELECT id, username, role, status FROM users", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Users in DB:");
            console.table(rows);
        }
    });
});

db.close();





