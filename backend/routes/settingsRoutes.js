const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes protected by Admin
router.use(verifyToken, isAdmin);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.get('/notification-logs', settingsController.getNotificationLogs);
router.post('/trigger-reminder', settingsController.triggerReminder);

module.exports = router;
