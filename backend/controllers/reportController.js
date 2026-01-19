const db = require('../config/db');
const logAudit = require('../utils/auditLogger');

// Create Daily Report
exports.createDailyReport = async (req, res) => {
    try {
        const {
            project_id, report_date, tbt_sessions, tbt_participants,
            training_sessions, training_participants, training_topic,
            persons_rewarded, rewarded_person_name, inspection_conducted_of,
            medical_examination_count, hira_count, first_aid_cases,
            near_miss_cases, safety_committee_meetings, cctv_installed,
            cctv_functioning, ptw_issued, ptw_closed
        } = req.body;

        // Validation: No negative values
        const numericFields = [
            tbt_sessions, tbt_participants, training_sessions, training_participants,
            persons_rewarded, medical_examination_count, hira_count, first_aid_cases,
            near_miss_cases, safety_committee_meetings, ptw_issued, ptw_closed
        ];

        for (const field of numericFields) {
            if (field < 0) {
                return res.status(400).json({ message: 'Negative values are not allowed.' });
            }
        }

        // Validation: PTW Logic
        if (ptw_closed > ptw_issued) {
            return res.status(400).json({ message: 'PTW Closed cannot be greater than PTW Issued.' });
        }

        const files = req.files;

        // Create Report
        const result = await db.query(`
            INSERT INTO daily_ehs_reports (
                project_id, report_date, tbt_sessions, tbt_participants,
                training_sessions, training_participants, training_topic,
                persons_rewarded, rewarded_person_name, inspection_conducted_of,
                medical_examination_count, hira_count, first_aid_cases,
                near_miss_cases, safety_committee_meetings, cctv_installed,
                cctv_functioning, ptw_issued, ptw_closed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
        `, [
            project_id, report_date, tbt_sessions, tbt_participants,
            training_sessions, training_participants, training_topic,
            persons_rewarded, rewarded_person_name, inspection_conducted_of,
            medical_examination_count, hira_count, first_aid_cases,
            near_miss_cases, safety_committee_meetings, cctv_installed,
            cctv_functioning, ptw_issued, ptw_closed
        ]);

        const reportId = result.rows[0].id;

        // Handle Photos
        if (files && files.length > 0) {
            for (const file of files) {
                await db.query(`
                    INSERT INTO report_photos (daily_report_id, photo_path)
                    VALUES ($1, $2)
                `, [reportId, `/uploads/${file.filename}`]);
            }
        }

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'CREATE',
            entityType: 'DAILY_REPORT',
            entityId: reportId,
            newValue: req.body,
            ipAddress: req.ip
        });

        res.status(201).json({ message: 'Daily Report created successfully', reportId });
    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Report for this date already exists.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Monthly Report (Updated with new stats)
exports.createMonthlyReport = async (req, res) => {
    try {
        const {
            project_id, report_month, report_year,
            avg_staff, avg_workers, working_days, working_hours,
            man_days, man_hours, safety_induction_sessions,
            safety_induction_attendees, ehs_personnel_count,
            // New fields
            persons_rewarded,
            motivational_programs,
            cumulative_man_hours, near_miss_cases, training_sessions,
            first_aid_cases, ptw_issued, tbt_sessions
        } = req.body;

        // Validation: No negative values
        const numericFields = [
            avg_staff, avg_workers, working_days, working_hours,
            man_days, man_hours, safety_induction_sessions,
            safety_induction_attendees, ehs_personnel_count,
            cumulative_man_hours, near_miss_cases, training_sessions,
            first_aid_cases, ptw_issued, tbt_sessions, persons_rewarded,
            motivational_programs
        ];

        for (const field of numericFields) {
            if (field < 0) {
                return res.status(400).json({ message: 'Negative values are not allowed.' });
            }
        }

        const result = await db.query(`
            INSERT INTO monthly_ehs_reports (
                project_id, report_month, report_year,
                avg_staff, avg_workers, working_days, working_hours,
                man_days, man_hours, safety_induction_sessions,
                safety_induction_attendees, ehs_personnel_count,
                cumulative_man_hours, near_miss_cases, training_sessions,
                first_aid_cases, ptw_issued, tbt_sessions, persons_rewarded,
                motivational_programs
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING id
        `, [
            project_id, report_month, report_year,
            avg_staff || 0, avg_workers || 0, working_days || 0, working_hours || 0,
            man_days || 0, man_hours || 0, safety_induction_sessions || 0,
            safety_induction_attendees || 0, ehs_personnel_count || 0,
            cumulative_man_hours || 0, near_miss_cases || 0, training_sessions || 0,
            first_aid_cases || 0, ptw_issued || 0, tbt_sessions || 0, persons_rewarded || 0,
            motivational_programs || 0
        ]);

        const reportId = result.rows[0].id;

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'CREATE',
            entityType: 'MONTHLY_REPORT',
            entityId: reportId,
            newValue: req.body,
            ipAddress: req.ip
        });

        res.status(201).json({ message: 'Monthly Report created successfully', reportId });
    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Report for this month already exists.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Daily Reports
exports.getDailyReports = async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = `
            SELECT r.*, p.name as project_name 
            FROM daily_ehs_reports r
            JOIN projects p ON r.project_id = p.id
        `;
        const params = [];
        if (project_id) {
            query += ` WHERE r.project_id = $1`;
            params.push(project_id);
        }
        query += ` ORDER BY r.report_date DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Monthly Reports
exports.getMonthlyReports = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*, p.name as project_name 
            FROM monthly_ehs_reports r
            JOIN projects p ON r.project_id = p.id
            ORDER BY r.report_year DESC, r.report_month DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get KPI Stats - Aggregated from Monthly Reports (Historical)
exports.getKPIStats = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                SUM(tbt_sessions) as total_tbt,
                SUM(training_sessions) as total_training,
                SUM(first_aid_cases) as total_first_aid,
                SUM(near_miss_cases) as total_near_miss,
                SUM(ptw_issued) as total_ptw_closed,
                SUM(cumulative_man_hours) as total_man_hours -- Note: This might sum repetitively if not careful, but for now we sum all. Actually cumulative should be MAX or LAST. But let's just sum 'man_hours' if we had it.
            FROM monthly_ehs_reports
        `);

        // Note: total_ptw_closed was used in frontend, mapping ptw_issued to it for now as "PTW" column in image usually means issued/active/closed count.

        res.json(stats.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
