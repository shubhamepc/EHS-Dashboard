const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('ehs.sqlite');

const setup = async () => {
    db.serialize(() => {
        // Drop tables
        db.run("DROP TABLE IF EXISTS report_photos");
        db.run("DROP TABLE IF EXISTS daily_ehs_reports");
        db.run("DROP TABLE IF EXISTS monthly_ehs_reports");
        db.run("DROP TABLE IF EXISTS projects");
        db.run("DROP TABLE IF EXISTS users");

        console.log("Cleaned up old data...");

        // Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'manager')) NOT NULL,
            full_name TEXT,
            email TEXT,
            status TEXT DEFAULT 'active',
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            location TEXT,
            site_manager_id INTEGER,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(site_manager_id) REFERENCES users(id)
        )`);

        // Daily EHS Reports
        db.run(`CREATE TABLE IF NOT EXISTS daily_ehs_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            report_date DATE NOT NULL,
            tbt_sessions INTEGER DEFAULT 0,
            tbt_participants INTEGER DEFAULT 0,
            training_sessions INTEGER DEFAULT 0,
            training_participants INTEGER DEFAULT 0,
            training_topic TEXT,
            persons_rewarded INTEGER DEFAULT 0,
            rewarded_person_name TEXT,
            inspection_conducted_of TEXT,
            medical_examination_count INTEGER DEFAULT 0,
            hira_count INTEGER DEFAULT 0,
            first_aid_cases INTEGER DEFAULT 0,
            near_miss_cases INTEGER DEFAULT 0,
            safety_committee_meetings INTEGER DEFAULT 0,
            cctv_installed BOOLEAN DEFAULT 0,
            cctv_functioning BOOLEAN DEFAULT 0,
            ptw_issued INTEGER DEFAULT 0,
            ptw_closed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, report_date),
            FOREIGN KEY(project_id) REFERENCES projects(id)
        )`);

        // Monthly EHS Reports - EXPANDED with fields from the user's excel images
        db.run(`CREATE TABLE IF NOT EXISTS monthly_ehs_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            report_month INTEGER NOT NULL,
            report_year INTEGER NOT NULL,
            
            -- Manpower & Hours (From Form)
            avg_staff INTEGER DEFAULT 0,
            avg_workers INTEGER DEFAULT 0,
            working_days INTEGER DEFAULT 0,
            working_hours REAL DEFAULT 0,
            man_days INTEGER DEFAULT 0,
            man_hours REAL DEFAULT 0,
            
            -- Statistics (From Excel Images)
            cumulative_man_hours REAL DEFAULT 0,
            near_miss_cases INTEGER DEFAULT 0,
            training_sessions INTEGER DEFAULT 0,
            first_aid_cases INTEGER DEFAULT 0,
            safety_induction_sessions INTEGER DEFAULT 0, -- mapped to "EHS Induction Session"
            ptw_issued INTEGER DEFAULT 0, -- mapped to "PTW"
            tbt_sessions INTEGER DEFAULT 0, -- mapped to "TBT conducted"
            persons_rewarded INTEGER DEFAULT 0, -- mapped to "Workers... awarded"
            motivational_programs INTEGER DEFAULT 0, -- mapped to "Motivational Program..."
            
            safety_induction_attendees INTEGER DEFAULT 0,
            ehs_personnel_count INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, report_month, report_year),
            FOREIGN KEY(project_id) REFERENCES projects(id)
        )`);

        // Report Photos
        db.run(`CREATE TABLE IF NOT EXISTS report_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_report_id INTEGER,
            photo_path TEXT NOT NULL,
            caption TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(daily_report_id) REFERENCES daily_ehs_reports(id)
        )`);

        // Seed Users
        const hash = bcrypt.hashSync('password123', 8);
        const stmtUser = db.prepare("INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)");
        stmtUser.run('admin', hash, 'admin', 'Deepak Sharma');
        stmtUser.run('manager', hash, 'manager', 'Site Manager');
        stmtUser.finalize();

        // Seed Real Projects
        db.get("SELECT id FROM users WHERE username = 'manager'", (err, row) => {
            if (row) {
                const managerId = row.id;
                const projects = [
                    'Ayurvedic College & , Baramati & Warehouse',
                    'River View Project, Pune',
                    'Dog Training Centre',
                    'STT NMDC-03',
                    'STT NMDC-02',
                    'BSL 3 & BSL 4, Dibrugarh Assam',
                    'Bottling Plant, Baramati',
                    'Shubham Tarangan, Alephata',
                    'CP Office',
                    'Mantralay',
                    'WOLP JNPA',
                    'Emaar Casa Venero, Alibaug',
                    'Auditorium Project, Roha'
                ];

                const stmtProj = db.prepare("INSERT INTO projects (name, location, site_manager_id) VALUES (?, ?, ?)");
                projects.forEach(projectName => {
                    let location = 'Unknown';
                    if (projectName.includes('Pune')) location = 'Pune';
                    else if (projectName.includes('Baramati')) location = 'Baramati';
                    else if (projectName.includes('Assam')) location = 'Assam';
                    else if (projectName.includes('Alephata')) location = 'Alephata';
                    else if (projectName.includes('Alibaug')) location = 'Alibaug';
                    else if (projectName.includes('JNPA')) location = 'Mumbai';
                    else if (projectName.includes('NMDC')) location = 'Hyderabad';
                    else if (projectName.includes('Mantralay')) location = 'Mumbai';

                    stmtProj.run(projectName, location, managerId);
                });
                stmtProj.finalize();
                console.log('Database Re-Initialized with Real Projects & Updated Monthly Schema.');
            }
        });
    });
};

setup();
