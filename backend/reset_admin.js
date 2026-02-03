const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const updatePassword = (username, password) => {
    const hash = bcrypt.hashSync(password, 10);
    db.run("UPDATE users SET password_hash = ? WHERE username = ?", [hash, username], function (err) {
        if (err) {
            console.error(`Error updating ${username}:`, err);
        } else {
            console.log(`Updated password for ${username}. Changes: ${this.changes}`);
        }
    });
};

db.serialize(() => {
    console.log("Resetting passwords to 'password123'...");
    updatePassword('admin', 'password123');
    updatePassword('manager', 'password123');
});

setTimeout(() => {
    db.close();
    console.log("Done.");
}, 1000);
