const db = require('../config/db');

// Get logs with filters
exports.getLogs = async (req, res) => {
    try {
        const { user_id, action, entity_type, start_date, end_date, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const params = [];
        let query = `
            SELECT l.*, u.username, u.full_name 
            FROM audit_logs l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE 1=1
        `;

        // Filters
        if (user_id) {
            params.push(user_id);
            query += ` AND l.user_id = $${params.length}`;
        }
        if (action) {
            params.push(action);
            query += ` AND l.action = $${params.length}`;
        }
        if (entity_type) {
            params.push(entity_type);
            query += ` AND l.entity_type = $${params.length}`;
        }
        if (start_date) {
            params.push(start_date);
            query += ` AND l.created_at >= $${params.length}`;
        }
        if (end_date) {
            params.push(end_date);
            query += ` AND l.created_at <= $${params.length}`;
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Count query
        const countParams = params.slice(0, params.length - 2);
        let countQuery = `SELECT COUNT(*) as total FROM audit_logs l WHERE 1=1`;
        let pCount = 0;
        if (user_id) { pCount++; countQuery += ` AND l.user_id = $${pCount}`; }
        if (action) { pCount++; countQuery += ` AND l.action = $${pCount}`; }
        if (entity_type) { pCount++; countQuery += ` AND l.entity_type = $${pCount}`; }
        if (start_date) { pCount++; countQuery += ` AND l.created_at >= $${pCount}`; }
        if (end_date) { pCount++; countQuery += ` AND l.created_at <= $${pCount}`; }

        const countResult = await db.query(countQuery, countParams);

        res.json({
            logs: result.rows,
            total: countResult.rows[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};
