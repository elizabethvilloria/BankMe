const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboardSummary);
router.get('/upcoming-payments', dashboardController.getUpcomingPayments);

module.exports = router; 