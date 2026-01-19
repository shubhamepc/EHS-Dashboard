const cron = require('node-cron');
const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');

// Check for missing reports and send reminders
const checkAndSendReminders = async () => {
    try {
        console.log('[CRON] Running monthly report reminder check...');

        // Get settings
        const settings = await db.query('SELECT key, value FROM system_settings');
        const config = {};
        settings.rows.forEach(row => {
            config[row.key] = row.value;
        });

        if (config.reminder_enabled !== 'true') {
            console.log('[CRON] Reminders are disabled');
            return;
        }

        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const reminderDays = config.reminder_days.split(',').map(d => parseInt(d.trim()));
        const escalationDay = parseInt(config.escalation_day);

        // Check if today is a reminder day
        if (!reminderDays.includes(currentDay) && currentDay !== escalationDay) {
            console.log(`[CRON] Not a reminder day. Current day: ${currentDay}`);
            return;
        }

        // Get all managers with their projects
        const managers = await db.query(`
            SELECT DISTINCT u.id, u.username, u.full_name, u.email, p.id as project_id, p.name as project_name
            FROM users u
            INNER JOIN projects p ON u.id = p.site_manager_id
            WHERE u.role = 'manager' AND p.status = 'active'
        `);

        if (managers.rows.length === 0) {
            console.log('[CRON] No active managers found');
            return;
        }

        // Check for missing reports
        for (const manager of managers.rows) {
            const reportCheck = await db.query(`
                SELECT id FROM monthly_ehs_reports 
                WHERE project_id = $1 AND report_month = $2 AND report_year = $3
            `, [manager.project_id, lastMonth, lastMonthYear]);

            if (reportCheck.rows.length === 0) {
                // Missing report - send reminder
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                const monthName = monthNames[lastMonth - 1];

                let subject, message;

                if (currentDay === escalationDay) {
                    // Escalation to EHS Head
                    subject = `URGENT: Missing EHS Report - ${manager.project_name}`;
                    message = `Dear EHS Head,\n\nThis is an escalation notice.\n\nManager ${manager.full_name} has not submitted the EHS report for ${monthName} ${lastMonthYear} for project "${manager.project_name}".\n\nPlease follow up immediately.\n\nRegards,\nEHS Reporting System`;

                    const ehsEmail = config.ehs_head_email || 'head.ehs@shubhamepc.com';
                    const sent = await sendEmail(ehsEmail, subject, message);

                    await logNotification(ehsEmail, null, 'ESCALATION', message, sent ? 'sent' : 'failed');
                } else {
                    // Regular reminder to manager
                    subject = `Reminder: Submit EHS Report for ${monthName} ${lastMonthYear}`;
                    message = `Dear ${manager.full_name},\n\nThis is a reminder to submit your EHS report for ${monthName} ${lastMonthYear} for project "${manager.project_name}".\n\nPlease log in to the EHS system and complete your submission.\n\nRegards,\nEHS Reporting System`;

                    const managerEmail = manager.email || `${manager.username}@shubhamepc.com`;
                    const sent = await sendEmail(managerEmail, subject, message);

                    await logNotification(managerEmail, null, 'REMINDER', message, sent ? 'sent' : 'failed');
                }
            }
        }

        console.log('[CRON] Reminder check completed');
    } catch (error) {
        console.error('[CRON] Error in reminder job:', error);
    }
};

// Log notification
const logNotification = async (email, phone, type, message, status) => {
    try {
        await db.query(`
            INSERT INTO notification_logs (recipient_email, recruit_phone, type, message, status)
            VALUES ($1, $2, $3, $4, $5)
        `, [email, phone, type, message, status]);
    } catch (error) {
        console.error('Failed to log notification:', error);
    }
};

// Schedule cron job - runs daily at 9 AM
const startReminderCron = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', checkAndSendReminders, {
        timezone: "Asia/Kolkata"
    });

    console.log('[CRON] Monthly reminder job scheduled (9:00 AM IST daily)');
};

module.exports = { startReminderCron, checkAndSendReminders };
