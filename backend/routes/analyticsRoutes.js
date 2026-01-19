const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

router.get('/safety-scores', analyticsController.getSafetyScores);
router.get('/safety-scores/trend', analyticsController.getOverallScoreTrend);
router.get('/safety-scores/project/:project_id', analyticsController.getProjectScoreTrend);

// Management Analytics
const managementController = require('../controllers/managementController');
router.get('/management/yearly-comparison', managementController.getYearlyComparison);
router.get('/management/quarterly', managementController.getQuarterlyAnalytics);
router.get('/management/incident-heatmap', managementController.getIncidentHeatmap);
router.get('/management/risk-classification', managementController.getProjectRiskClassification);
router.get('/management/summary', managementController.getManagementSummary);

module.exports = router;
