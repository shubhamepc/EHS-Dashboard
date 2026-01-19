const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ehs.sqlite');
const db = new sqlite3.Database(dbPath);

const seedData = async () => {
    db.serialize(() => {
        // Get all projects
        db.all("SELECT id, name FROM projects", [], (err, projects) => {
            if (err) {
                console.error("Error fetching projects:", err);
                return;
            }

            if (projects.length === 0) {
                console.log("No projects found. Please run setup_sqlite.js first.");
                return;
            }

            console.log(`Seeding data for ${projects.length} projects for year 2025...`);

            const stmt = db.prepare(`INSERT OR REPLACE INTO monthly_ehs_reports (
                project_id, report_month, report_year, 
                avg_staff, avg_workers, working_days, working_hours, man_days, man_hours,
                cumulative_man_hours, near_miss_cases, training_sessions, first_aid_cases,
                safety_induction_sessions, ptw_issued, tbt_sessions, persons_rewarded,
                motivational_programs, safety_induction_attendees, ehs_personnel_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            projects.forEach(project => {
                let cumulativeHours = 0;

                // Seed for each month of 2025
                for (let month = 1; month <= 12; month++) {
                    // Generate realistic random data
                    const avg_staff = 10 + Math.floor(Math.random() * 15); // 10-25 staff
                    const avg_workers = 50 + Math.floor(Math.random() * 150); // 50-200 workers
                    const working_days = 24 + Math.floor(Math.random() * 4); // 24-27 days
                    const working_hours = 8; // Standard shift

                    const daily_manpower = avg_staff + avg_workers;
                    const man_days = daily_manpower * working_days;
                    const man_hours = man_days * working_hours;
                    cumulativeHours += man_hours;

                    // Safety Metrics
                    const near_miss = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0; // Occasional near miss
                    const first_aid = Math.random() > 0.85 ? Math.floor(Math.random() * 2) : 0; // Rare first aid
                    const training = 2 + Math.floor(Math.random() * 4); // 2-5 training sessions
                    const tbt = working_days * (1 + Math.floor(Math.random() * 2)); // Daily TBTs (1-2 per day approx)
                    const ptw = 20 + Math.floor(Math.random() * 40); // 20-60 permits
                    const induction = 1 + Math.floor(Math.random() * 4); // 1-4 inductions
                    const rewarded = Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0;
                    const motivational = Math.random() > 0.7 ? 1 : 0;
                    const induction_attendees = induction * (5 + Math.floor(Math.random() * 10));
                    const ehs_personnel = 2;

                    stmt.run(
                        project.id, month, 2025,
                        avg_staff, avg_workers, working_days, working_hours, man_days, man_hours,
                        cumulativeHours, near_miss, training, first_aid,
                        induction, ptw, tbt, rewarded,
                        motivational, induction_attendees, ehs_personnel
                    );
                }
            });

            stmt.finalize(() => {
                console.log("Seeding complete for 2025.");
                db.close();
            });
        });
    });
};

seedData();
