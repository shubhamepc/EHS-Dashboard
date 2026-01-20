const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Adding ptw_closed column to monthly_ehs_reports...");
    db.run("ALTER TABLE monthly_ehs_reports ADD COLUMN ptw_closed INTEGER DEFAULT 0", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log("Column ptw_closed already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Column ptw_closed added successfully.");
        }
    });
});

db.close();
