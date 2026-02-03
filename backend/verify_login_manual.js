const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const checkUser = (username, password) => {
    console.log(`Checking user: ${username}`);
    db.get("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [username], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return;
        }

        if (!row) {
            console.log("❌ User not found in DB.");
            return;
        }

        console.log("✅ User found in DB.");
        console.log(`   ID: ${row.id}`);
        console.log(`   Role: ${row.role}`);
        console.log(`   Stored Hash: ${row.password_hash}`);

        const valid = bcrypt.compareSync(password, row.password_hash);
        console.log(`   Hash Verification: ${valid ? "MATCH ✅" : "MISMATCH ❌"}`);
    });
};

db.serialize(() => {
    checkUser('admin', 'password123');
    setTimeout(() => checkUser('manager', 'password123'), 500);
});

// Keep alive for async ops
setTimeout(() => db.close(), 2000);
