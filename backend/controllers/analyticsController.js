const db = require('../config/db');

// Calculate safety score based on formula
const calculateSafetyScore = (data) => {
    let score = 100;

    score -= (data.first_aid_cases || 0) * 2;
    score -= (data.near_miss_cases || 0) * 3;
    score -= ((data.ptw_issued || 0) - (data.ptw_closed || 0)) * 1;
    score += (data.training_sessions || 0) * 2;
    score += (data.tbt_sessions || 0) * 1;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
};

// Get safety scores for all projects
exports.getSafetyScores = async (req, res) => {
    try {
        const { month, year } = req.query;

        let query = `
            SELECT 
                p.id as project_id,
                p.name as project_name,
                r.report_month,
                r.report_year,
                r.first_aid_cases,
                r.near_miss_cases,
                r.ptw_issued,
                r.ptw_closed,
                r.training_sessions,
                r.tbt_sessions
            FROM projects p
            LEFT JOIN monthly_ehs_reports r ON p.id = r.project_id
            WHERE p.status = 'active'
        `;

        const params = [];
        if (month && year) {
            params.push(month, year);
            query += ` AND r.report_month = $1 AND r.report_year = $2`;
        }

        query += ` ORDER BY p.name`;

        const result = await db.query(query, params);

        // Calculate scores for each project
        const projectScores = {};

        result.rows.forEach(row => {
            if (!row.report_month) {
                // No report data
                if (!projectScores[row.project_id]) {
                    projectScores[row.project_id] = {
                        project_id: row.project_id,
                        project_name: row.project_name,
                        score: null,
                        status: 'No Data',
                        reports_count: 0
                    };
                }
                return;
            }

            const score = calculateSafetyScore(row);

            if (!projectScores[row.project_id]) {
                projectScores[row.project_id] = {
                    project_id: row.project_id,
                    project_name: row.project_name,
                    total_score: 0,
                    reports_count: 0,
                    monthly_scores: []
                };
            }

            projectScores[row.project_id].total_score += score;
            projectScores[row.project_id].reports_count += 1;
            projectScores[row.project_id].monthly_scores.push({
                month: row.report_month,
                year: row.report_year,
                score: score
            });
        });

        // Calculate average scores and determine status
        const scores = Object.values(projectScores).map(project => {
            if (project.reports_count === 0) {
                return {
                    project_id: project.project_id,
                    project_name: project.project_name,
                    score: null,
                    status: 'No Data',
                    monthly_scores: []
                };
            }

            const avgScore = Math.round(project.total_score / project.reports_count);
            let status;

            if (avgScore >= 80) status = 'Good';
            else if (avgScore >= 50) status = 'Medium';
            else status = 'High Risk';

            return {
                project_id: project.project_id,
                project_name: project.project_name,
                score: avgScore,
                status: status,
                monthly_scores: project.monthly_scores || []
            };
        });

        // Sort by score (descending) and add rank
        scores.sort((a, b) => (b.score || 0) - (a.score || 0));
        scores.forEach((item, index) => {
            item.rank = item.score !== null ? index + 1 : null;
        });

        // Calculate overall average
        const validScores = scores.filter(s => s.score !== null);
        const overallAverage = validScores.length > 0
            ? Math.round(validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length)
            : 0;

        res.json({
            overall_average: overallAverage,
            projects: scores
        });
    } catch (error) {
        console.error('getSafetyScores Error:', error);
        res.status(500).json({ message: 'Failed to calculate safety scores', error: error.message });
    }
};

// Get safety score trend for a specific project
exports.getProjectScoreTrend = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { months = 6 } = req.query;

        const result = await db.query(`
            SELECT 
                report_month,
                report_year,
                first_aid_cases,
                near_miss_cases,
                ptw_issued,
                ptw_closed,
                training_sessions,
                tbt_sessions
            FROM monthly_ehs_reports
            WHERE project_id = $1
            ORDER BY report_year DESC, report_month DESC
            LIMIT $2
        `, [project_id, months]);

        const trend = result.rows.map(row => ({
            month: row.report_month,
            year: row.report_year,
            score: calculateSafetyScore(row)
        })).reverse(); // Reverse to show chronological order

        res.json({ trend });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch score trend' });
    }
};

// Get overall safety score trend (all projects combined)
exports.getOverallScoreTrend = async (req, res) => {
    try {
        const { months = 12 } = req.query;

        const result = await db.query(`
            SELECT 
                report_month,
                report_year,
                AVG(
                    100 
                    - (first_aid_cases * 2)
                    - (near_miss_cases * 3)
                    - ((ptw_issued - COALESCE(ptw_closed, 0)) * 1)
                    + (training_sessions * 2)
                    + (tbt_sessions * 1)
                ) as avg_score
            FROM monthly_ehs_reports
            GROUP BY report_year, report_month
            ORDER BY report_year DESC, report_month DESC
            LIMIT $1
        `, [months]);

        const trend = result.rows.map(row => ({
            month: row.report_month,
            year: row.report_year,
            score: Math.max(0, Math.min(100, Math.round(row.avg_score)))
        })).reverse();

        res.json({ trend });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch overall trend' });
    }
};
