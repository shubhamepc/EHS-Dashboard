const db = require('../config/db');
const logAudit = require('../utils/auditLogger');

exports.createProject = async (req, res) => {
    const { name, location, site_manager_id } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO projects (name, location, site_manager_id) VALUES ($1, $2, $3) RETURNING *',
            [name, location, site_manager_id]
        );
        const newProject = result.rows[0];

        logAudit({
            userId: req.userId,
            action: 'CREATE',
            entityType: 'PROJECT',
            entityId: newProject.id,
            newValue: newProject,
            ipAddress: req.ip
        });

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        // Join with users to get manager name. 
        // Fixed: Use LEFT JOIN correctly and select full_name if available or username
        const result = await db.query(`
            SELECT p.*, u.full_name as site_manager_name 
            FROM projects p 
            LEFT JOIN users u ON p.site_manager_id = u.id
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateProject = async (req, res) => {
    const { name, location, site_manager_id, status } = req.body;
    try {
        // Fetch old value
        const oldProject = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
        if (oldProject.rows.length === 0) return res.status(404).json({ message: 'Project not found' });

        const result = await db.query(
            'UPDATE projects SET name = $1, location = $2, site_manager_id = $3, status = $4 WHERE id = $5 RETURNING *',
            [name, location, site_manager_id, status, req.params.id]
        );
        const updatedProject = result.rows[0];

        logAudit({
            userId: req.userId,
            action: 'UPDATE',
            entityType: 'PROJECT',
            entityId: req.params.id,
            oldValue: oldProject.rows[0],
            newValue: updatedProject,
            ipAddress: req.ip
        });

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
