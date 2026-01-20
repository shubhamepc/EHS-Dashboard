const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const newPassword = 'password';
const hashedPassword = bcrypt.hashSync(newPassword, 12);

db.serialize(() => {
    // Reset admin password
    db.run("UPDATE users SET password_hash = ? WHERE username = 'admin'", [hashedPassword], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        console.log(`Password for user 'admin' has been reset to: ${newPassword}`);
    });

    // Also reset manager password just in case
    db.run("UPDATE users SET password_hash = ? WHERE username = 'manager'", [hashedPassword], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        console.log(`Password for user 'manager' has been reset to: ${newPassword}`);
    });
});

db.close();
