const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logAudit = require('../utils/auditLogger');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid User or Password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: 86400, // 24 hours
        });

        // Log Audit
        logAudit({
            userId: user.id,
            action: 'LOGIN',
            entityType: 'AUTH',
            ipAddress: req.ip
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role,
            token: token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    // Basic registration for setup purposes
    const { username, password, role, full_name } = req.body;
    try {
        const hash = bcrypt.hashSync(password, 8);
        const result = await db.query(
            'INSERT INTO users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
            [username, hash, role, full_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManagers = async (req, res) => {
    try {
        const result = await db.query("SELECT id, username, full_name FROM users WHERE role = 'manager'");
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
