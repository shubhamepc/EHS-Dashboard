const nodemailer = require('nodemailer');

// Configure Transporter (Mock for now, normally use env vars)
// For development, we often use Ethereal or just console log if no real SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass"
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        if (!to) {
            console.log('Skipping email: No recipient defined');
            return false;
        }

        // Check if we are in pure dev mode without SMTP
        if (!process.env.SMTP_HOST) {
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
            return true;
        }

        const info = await transporter.sendMail({
            from: '"Shubham EHS System" <noreply@shubhamepc.com>',
            to,
            subject,
            text,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Email Error:", error);
        return false;
    }
};

module.exports = { sendEmail };
