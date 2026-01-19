const db = require('../config/db');

// Yearly comparison analytics
exports.getYearlyComparison = async (req, res) => {
    try {
        const { years } = req.query; // e.g., "2024,2025"
        const yearList = years ? years.split(',').map(y => parseInt(y)) : [new Date().getFullYear(), new Date().getFullYear() - 1];

        const result = await db.query(`
            SELECT 
                report_year,
                SUM(tbt_sessions) as total_tbt,
                SUM(training_sessions) as total_training,
                SUM(first_aid_cases) as total_first_aid,
                SUM(near_miss_cases) as total_near_miss,
                SUM(ptw_issued) as total_ptw_issued,
                SUM(ptw_closed) as total_ptw_closed,
                SUM(man_hours) as total_man_hours,
                COUNT(DISTINCT project_id) as active_projects
            FROM monthly_ehs_reports
            WHERE report_year IN (${yearList.map((_, i) => `$${i + 1}`).join(',')})
            GROUP BY report_year
            ORDER BY report_year
        `, yearList);

        res.json({ comparison: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch yearly comparison' });
    }
};

// Quarter-wise analytics
exports.getQuarterlyAnalytics = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const result = await db.query(`
            SELECT 
                CASE 
                    WHEN report_month BETWEEN 1 AND 3 THEN 'Q1'
                    WHEN report_month BETWEEN 4 AND 6 THEN 'Q2'
                    WHEN report_month BETWEEN 7 AND 9 THEN 'Q3'
                    ELSE 'Q4'
                END as quarter,
                SUM(tbt_sessions) as tbt_sessions,
                SUM(training_sessions) as training_sessions,
                SUM(first_aid_cases) as first_aid_cases,
                SUM(near_miss_cases) as near_miss_cases,
                SUM(man_hours) as man_hours,
                AVG(
                    100 
                    - (first_aid_cases * 2)
                    - (near_miss_cases * 3)
                    - ((ptw_issued - COALESCE(ptw_closed, 0)) * 1)
                    + (training_sessions * 2)
                    + (tbt_sessions * 1)
                ) as avg_safety_score
            FROM monthly_ehs_reports
            WHERE report_year = $1
            GROUP BY quarter
            ORDER BY quarter
        `, [year]);

        res.json({ quarters: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quarterly analytics' });
    }
};

// Incident heatmap data (month x project)
exports.getIncidentHeatmap = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const result = await db.query(`
            SELECT 
                p.name as project_name,
                r.report_month,
                (r.first_aid_cases + r.near_miss_cases) as total_incidents
            FROM monthly_ehs_reports r
            JOIN projects p ON r.project_id = p.id
            WHERE r.report_year = $1
            ORDER BY p.name, r.report_month
        `, [year]);

        // Transform to heatmap format
        const heatmap = {};
        result.rows.forEach(row => {
            if (!heatmap[row.project_name]) {
                heatmap[row.project_name] = Array(12).fill(0);
            }
            heatmap[row.project_name][row.report_month - 1] = row.total_incidents;
        });

        res.json({ heatmap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch incident heatmap' });
    }
};

// Project risk classification
exports.getProjectRiskClassification = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                p.id,
                p.name,
                COUNT(r.id) as report_count,
                SUM(r.first_aid_cases) as total_first_aid,
                SUM(r.near_miss_cases) as total_near_miss,
                AVG(r.first_aid_cases + r.near_miss_cases) as avg_incidents_per_month,
                MAX(r.first_aid_cases + r.near_miss_cases) as max_incidents_month,
                AVG(
                    100 
                    - (r.first_aid_cases * 2)
                    - (r.near_miss_cases * 3)
                    - ((r.ptw_issued - COALESCE(r.ptw_closed, 0)) * 1)
                    + (r.training_sessions * 2)
                    + (r.tbt_sessions * 1)
                ) as avg_safety_score
            FROM projects p
            LEFT JOIN monthly_ehs_reports r ON p.id = r.project_id
            WHERE p.status = 'active'
            GROUP BY p.id, p.name
        `);

        const classified = result.rows.map(project => {
            let risk_level = 'Low';
            let risk_color = 'green';

            const avgIncidents = project.avg_incidents_per_month || 0;
            const safetyScore = project.avg_safety_score || 100;

            if (avgIncidents > 5 || safetyScore < 50) {
                risk_level = 'Critical';
                risk_color = 'red';
            } else if (avgIncidents > 3 || safetyScore < 70) {
                risk_level = 'High';
                risk_color = 'orange';
            } else if (avgIncidents > 1 || safetyScore < 85) {
                risk_level = 'Medium';
                risk_color = 'yellow';
            }

            return {
                ...project,
                risk_level,
                risk_color,
                avg_incidents_per_month: parseFloat(avgIncidents.toFixed(2)),
                avg_safety_score: Math.round(safetyScore)
            };
        });

        // Sort by risk (Critical first)
        const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        classified.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

        res.json({ projects: classified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to classify project risks' });
    }
};

// Management summary for PDF export
exports.getManagementSummary = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month } = req.query;

        // Overall statistics
        const statsQuery = month
            ? `WHERE report_year = $1 AND report_month = $2`
            : `WHERE report_year = $1`;
        const statsParams = month ? [year, month] : [year];

        const stats = await db.query(`
            SELECT 
                COUNT(DISTINCT project_id) as total_projects,
                SUM(tbt_sessions) as total_tbt,
                SUM(training_sessions) as total_training,
                SUM(first_aid_cases) as total_first_aid,
                SUM(near_miss_cases) as total_near_miss,
                SUM(man_hours) as total_man_hours,
                AVG(
                    100 
                    - (first_aid_cases * 2)
                    - (near_miss_cases * 3)
                    - ((ptw_issued - COALESCE(ptw_closed, 0)) * 1)
                    + (training_sessions * 2)
                    + (tbt_sessions * 1)
                ) as avg_safety_score
            FROM monthly_ehs_reports
            ${statsQuery}
        `, statsParams);

        // Top performing projects
        const topProjects = await db.query(`
            SELECT 
                p.name,
                AVG(
                    100 
                    - (r.first_aid_cases * 2)
                    - (r.near_miss_cases * 3)
                    - ((r.ptw_issued - COALESCE(r.ptw_closed, 0)) * 1)
                    + (r.training_sessions * 2)
                    + (r.tbt_sessions * 1)
                ) as safety_score
            FROM monthly_ehs_reports r
            JOIN projects p ON r.project_id = p.id
            ${statsQuery}
            GROUP BY p.name
            ORDER BY safety_score DESC
            LIMIT 5
        `, statsParams);

        // Projects needing attention
        const riskProjects = await db.query(`
            SELECT 
                p.name,
                SUM(r.first_aid_cases + r.near_miss_cases) as total_incidents,
                AVG(
                    100 
                    - (r.first_aid_cases * 2)
                    - (r.near_miss_cases * 3)
                    - ((r.ptw_issued - COALESCE(r.ptw_closed, 0)) * 1)
                    + (r.training_sessions * 2)
                    + (r.tbt_sessions * 1)
                ) as safety_score
            FROM monthly_ehs_reports r
            JOIN projects p ON r.project_id = p.id
            ${statsQuery}
            GROUP BY p.name
            HAVING AVG(
                100 
                - (r.first_aid_cases * 2)
                - (r.near_miss_cases * 3)
                - ((r.ptw_issued - COALESCE(r.ptw_closed, 0)) * 1)
                + (r.training_sessions * 2)
                + (r.tbt_sessions * 1)
            ) < 70
            ORDER BY safety_score ASC
            LIMIT 5
        `, statsParams);

        res.json({
            period: month ? `${month}/${year}` : year,
            statistics: stats.rows[0],
            top_performers: topProjects.rows,
            risk_projects: riskProjects.rows,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate management summary' });
    }
};
