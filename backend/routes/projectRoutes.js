const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, projectController.getAllProjects);
router.get('/:id', verifyToken, projectController.getProjectById);
router.post('/', [verifyToken, isAdmin], projectController.createProject);
router.put('/:id', [verifyToken, isAdmin], projectController.updateProject);

module.exports = router;
