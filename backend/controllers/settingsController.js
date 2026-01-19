const db = require('../config/db');

// Get all settings
exports.getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const { reminder_enabled, reminder_days, escalation_day, ehs_head_email } = req.body;

        const updates = [
            { key: 'reminder_enabled', value: reminder_enabled },
            { key: 'reminder_days', value: reminder_days },
            { key: 'escalation_day', value: escalation_day },
            { key: 'ehs_head_email', value: ehs_head_email }
        ];

        for (const update of updates) {
            if (update.value !== undefined) {
                await db.query(`
                    INSERT INTO system_settings (key, value, updated_at)
                    VALUES ($1, $2, CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
                `, [update.key, update.value]);
            }
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};

// Get notification logs
exports.getNotificationLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await db.query(`
            SELECT * FROM notification_logs 
            ORDER BY sent_at DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await db.query('SELECT COUNT(*) as total FROM notification_logs');

        res.json({
            logs: result.rows,
            total: countResult.rows[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notification logs' });
    }
};

// Manual trigger for testing
exports.triggerReminder = async (req, res) => {
    try {
        const { checkAndSendReminders } = require('../services/reminderCron');
        await checkAndSendReminders();
        res.json({ message: 'Reminder check triggered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to trigger reminder' });
    }
};
