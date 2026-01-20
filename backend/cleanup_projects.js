const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const projectsToKeep = [
    'Auditorium Project, Roha',
    'Ayurvedic College & , Baramati & Warehouse',
    'BSL 3 & BSL 4, Dibrugarh Assam',
    'Bottling Plant, Baramati',
    'CP Office',
    'Dog Training Centre',
    'Emaar Casa Venero, Alibaug',
    'Mantralay',
    'River View Project, Pune',
    'STT NMDC-02',
    'STT NMDC-03',
    'Shubham Tarangan, Alephata',
    'WOLP JNPA'
];

db.serialize(() => {
    const placeholders = projectsToKeep.map(() => '?').join(',');
    console.log(`Keeping ${projectsToKeep.length} projects.`);

    const sql = `DELETE FROM projects WHERE name NOT IN (${placeholders})`;

    db.run(sql, projectsToKeep, function (err) {
        if (err) {
            return console.error("Error deleting projects:", err.message);
        }
        console.log(`Deleted ${this.changes} projects.`);
    });

    // Verify remaining
    db.all("SELECT id, name FROM projects ORDER BY name", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log("\nRemaining Projects:");
            rows.forEach(r => console.log(`- ${r.name}`));
        }
    });
});

db.close();
