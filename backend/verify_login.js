const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('ehs.sqlite');

const USERNAME = 'Manager';
const PASSWORD = 'password123';

db.serialize(() => {
    db.get("SELECT * FROM users WHERE username = ?", [USERNAME], (err, row) => {
        if (err) {
            console.error(err);
        } else if (!row) {
            console.log("User not found!");
        } else {
            console.log("User found:", row.username);
            console.log("Hash:", row.password_hash);
            const valid = bcrypt.compareSync(PASSWORD, row.password_hash);
            console.log("Password Valid?", valid);
        }
    });
});

db.close();
