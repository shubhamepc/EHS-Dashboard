const db = require('../config/db');
const bcrypt = require('bcryptjs');
const logAudit = require('../utils/auditLogger');

// List users with pagination and filtering (exclude soft-deleted)
exports.getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10, include_deleted = false } = req.query;
        const offset = (page - 1) * limit;
        const params = [];
        let query = `
            SELECT u.id, u.username, u.full_name, u.role, u.status, u.email, u.created_at, u.deleted_at,
            COUNT(p.id) as assigned_projects_count
            FROM users u
            LEFT JOIN projects p ON u.id = p.site_manager_id
            WHERE 1=1
        `;

        // Exclude soft-deleted users by default
        if (include_deleted !== 'true') {
            query += ` AND u.deleted_at IS NULL`;
        }

        if (role) {
            params.push(role);
            query += ` AND u.role = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (u.username LIKE $${params.length} OR u.full_name LIKE $${params.length})`;
        }

        query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count for pagination
        const countParams = params.slice(0, params.length - 2);
        let countQuery = `SELECT COUNT(*) as total FROM users u WHERE 1=1`;
        if (include_deleted !== 'true') countQuery += ` AND u.deleted_at IS NULL`;
        if (role) countQuery += ` AND u.role = $1`;
        if (search) countQuery += ` AND (u.username LIKE $${role ? 2 : 1} OR u.full_name LIKE $${role ? 2 : 1})`;

        const countResult = await db.query(countQuery, countParams);

        res.json({
            users: result.rows,
            total: countResult.rows[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// Create User with validation
exports.createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, email } = req.body;

        // Validation
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Email validation
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check duplicate
        const check = await db.query('SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Use 12 rounds for production security
        const hash = await bcrypt.hash(password, 12);

        const result = await db.query(`
            INSERT INTO users (username, password_hash, role, full_name, email, status)
            VALUES ($1, $2, $3, $4, $5, 'active')
            RETURNING id, username, role, full_name, email, status, created_at
        `, [username, hash, role, full_name, email]);

        const newUser = result.rows[0];

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'CREATE',
            entityType: 'USER',
            entityId: newUser.id,
            newValue: newUser,
            ipAddress: req.ip
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
};

// Update User with protection
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role, password, email, status } = req.body;

        // Fetch old value for audit
        const oldUser = await db.query('SELECT id, username, role, full_name, email, status FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (oldUser.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from demoting themselves
        if (parseInt(id) === req.userId && oldUser.rows[0].role === 'admin' && role !== 'admin') {
            return res.status(403).json({ message: 'Cannot demote yourself from admin role' });
        }

        // Check if this is the last admin
        if (oldUser.rows[0].role === 'admin' && role !== 'admin') {
            const adminCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND deleted_at IS NULL");
            if (adminCount.rows[0].count <= 1) {
                return res.status(403).json({ message: 'Cannot change role of last admin user' });
            }
        }

        // Email validation
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        let query = 'UPDATE users SET full_name = $1, role = $2, email = $3';
        const params = [full_name, role, email];

        if (status) {
            query += ', status = $4';
            params.push(status);
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }
            const hash = await bcrypt.hash(password, 12);
            query += `, password_hash = $${params.length + 1}`;
            params.push(hash);
        }

        query += ` WHERE id = $${params.length + 1} RETURNING id, username, role, full_name, email, status`;
        params.push(id);

        const result = await db.query(query, params);
        const updatedUser = result.rows[0];

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'UPDATE',
            entityType: 'USER',
            entityId: id,
            oldValue: oldUser.rows[0],
            newValue: updatedUser,
            ipAddress: req.ip
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user' });
    }
};

// Soft Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Don't delete self
        if (parseInt(id) === req.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Fetch old value for audit
        const oldUser = await db.query('SELECT id, username, role, full_name FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (oldUser.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // Check if this is the last admin
        if (oldUser.rows[0].role === 'admin') {
            const adminCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND deleted_at IS NULL");
            if (adminCount.rows[0].count <= 1) {
                return res.status(403).json({ message: 'Cannot delete the last admin user' });
            }
        }

        // Soft delete
        await db.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP, status = $1 WHERE id = $2', ['deleted', id]);

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'DELETE',
            entityType: 'USER',
            entityId: id,
            oldValue: oldUser.rows[0],
            ipAddress: req.ip
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password || new_password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const user = await db.query('SELECT id, username FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const hash = await bcrypt.hash(new_password, 12);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'RESET_PASSWORD',
            entityType: 'USER',
            entityId: id,
            newValue: { username: user.rows[0].username },
            ipAddress: req.ip
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

// Toggle User Status (Activate/Deactivate)
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await db.query('SELECT id, username, status FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const newStatus = user.rows[0].status === 'active' ? 'inactive' : 'active';
        await db.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, id]);

        // Audit Log
        logAudit({
            userId: req.userId,
            action: 'STATUS_CHANGE',
            entityType: 'USER',
            entityId: id,
            oldValue: { status: user.rows[0].status },
            newValue: { status: newStatus },
            ipAddress: req.ip
        });

        res.json({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, status: newStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to toggle user status' });
    }
};
