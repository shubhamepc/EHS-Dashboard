const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Limit 5MB

router.use(verifyToken);

// Daily Reports
router.post('/daily', upload.array('photos', 5), reportController.createDailyReport);
router.get('/daily', reportController.getDailyReports);

// Monthly Reports
router.post('/monthly', reportController.createMonthlyReport);
router.get('/monthly', reportController.getMonthlyReports);

// KPI Stats
router.get('/kpi', reportController.getKPIStats);

// Default Route: Now pointing to Monthly Reports to show the Historical Data by default
router.get('/', reportController.getMonthlyReports);

module.exports = router;
