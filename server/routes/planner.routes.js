const express = require('express');
const router = express.Router();
const { getTodaysPlan, getDashboardData } = require('../controllers/planner.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/today', protect, getTodaysPlan);
// Dedicated endpoint for all combined dashboard data
router.get('/dashboard', protect, getDashboardData);

module.exports = router;