const express = require('express');
const { getDashboardStats, getMonthlySales, getRecentOrders } = require('../controllers/dashboard');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require admin access
router.use(protect, admin);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get monthly sales data for chart
router.get('/sales', getMonthlySales);

// Get recent orders
router.get('/recent-orders', getRecentOrders);

module.exports = router;
