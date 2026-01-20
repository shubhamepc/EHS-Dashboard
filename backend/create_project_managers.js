const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const generateUsername = (projectName) => {
    // Generate code like S-ROHA, S-PUNE, etc.
    const parts = projectName.split(/[ ,&]+/);
    let code = parts[0].substring(0, 4).toUpperCase();

    // Custom logic for better codes
    if (projectName.includes('Roha')) code = 'ROHA';
    if (projectName.includes('Baramati')) code = 'BARAMATI';
    if (projectName.includes('Dibrugarh')) code = 'ASSAM';
    if (projectName.includes('CP Office')) code = 'CPOFFICE';
    if (projectName.includes('Dog Training')) code = 'DOGTRAIN';
    if (projectName.includes('Emaar')) code = 'EMAAR';
    if (projectName.includes('Mantralay')) code = 'MANTRALAY';
    if (projectName.includes('River View')) code = 'RIVERVIEW';
    if (projectName.includes('STT NMDC-02')) code = 'NMDC02';
    if (projectName.includes('STT NMDC-03')) code = 'NMDC03';
    if (projectName.includes('Tarangan')) code = 'TARANGAN';
    if (projectName.includes('JNPA')) code = 'JNPA';

    return `SM_${code}`;
};

const runMigration = async () => {
    // 1. Get all projects
    const projects = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM projects", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const hashedPassword = await bcrypt.hash('password', 10);

    console.log(`Found ${projects.length} projects. Creating managers...`);

    // 2. For each project, create a user and assign
    for (const p of projects) {
        const username = generateUsername(p.name);
        const fullName = `Manager - ${p.name}`;

        // Check if user exists, else create
        await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
                if (err) return reject(err);

                if (row) {
                    // Update existing
                    console.log(`Updating existing user ${username}...`);
                    db.run("UPDATE projects SET site_manager_id = ? WHERE id = ?", [row.id, p.id], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                } else {
                    // Create new
                    console.log(`Creating new user ${username}...`);
                    db.run(`INSERT INTO users (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)`,
                        [fullName, username, hashedPassword, 'manager'],
                        function (err) {
                            if (err) return reject(err);
                            const newUserId = this.lastID;

                            // Assign to project
                            db.run("UPDATE projects SET site_manager_id = ? WHERE id = ?", [newUserId, p.id], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    );
                }
            });
        });
    }

    console.log("Migration complete.");

    // List Creds
    db.all("SELECT p.name as project, u.username FROM projects p JOIN users u ON p.site_manager_id = u.id", (err, rows) => {
        console.log("\nNew Assignments:");
        rows.forEach(r => console.log(`${r.username.padEnd(15)} -> ${r.project}`));
    });
};

runMigration();
