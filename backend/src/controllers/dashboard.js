const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Current month start and end
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    // Previous month start and end
    const previousMonthStart = new Date(previousMonthYear, previousMonth, 1);
    const previousMonthEnd = new Date(previousMonthYear, previousMonth + 1, 0, 23, 59, 59, 999);

    // Total revenue - current month
    const currentMonthRevenue = await Order.sum('total', {
      where: {
        createdAt: {
          [Op.between]: [currentMonthStart, currentMonthEnd]
        },
        status: {
          [Op.not]: 'cancelled'
        }
      }
    }) || 0;

    // Total revenue - previous month
    const previousMonthRevenue = await Order.sum('total', {
      where: {
        createdAt: {
          [Op.between]: [previousMonthStart, previousMonthEnd]
        },
        status: {
          [Op.not]: 'cancelled'
        }
      }
    }) || 0;

    // Calculate revenue change percentage
    const revenueChange = previousMonthRevenue === 0 
      ? 100 
      : Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);

    // Total orders - current month
    const currentMonthOrders = await Order.count({
      where: {
        createdAt: {
          [Op.between]: [currentMonthStart, currentMonthEnd]
        }
      }
    });

    // Total orders - previous month
    const previousMonthOrders = await Order.count({
      where: {
        createdAt: {
          [Op.between]: [previousMonthStart, previousMonthEnd]
        }
      }
    });

    // Calculate orders change percentage
    const ordersChange = previousMonthOrders === 0 
      ? 100 
      : Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100);

    // Total customers (users)
    const totalCustomers = await User.count({
      where: {
        role: 'user'
      }
    });

    // New customers - current month
    const currentMonthCustomers = await User.count({
      where: {
        role: 'user',
        createdAt: {
          [Op.between]: [currentMonthStart, currentMonthEnd]
        }
      }
    });

    // New customers - previous month
    const previousMonthCustomers = await User.count({
      where: {
        role: 'user',
        createdAt: {
          [Op.between]: [previousMonthStart, previousMonthEnd]
        }
      }
    });

    // Calculate customers change percentage
    const customersChange = previousMonthCustomers === 0 
      ? 100 
      : Math.round(((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100);

    // Total products
    const totalProducts = await Product.count();

    // New products - current month
    const currentMonthProducts = await Product.count({
      where: {
        createdAt: {
          [Op.between]: [currentMonthStart, currentMonthEnd]
        }
      }
    });

    // New products - previous month
    const previousMonthProducts = await Product.count({
      where: {
        createdAt: {
          [Op.between]: [previousMonthStart, previousMonthEnd]
        }
      }
    });

    // Calculate products change percentage
    const productsChange = previousMonthProducts === 0 
      ? 100 
      : Math.round(((currentMonthProducts - previousMonthProducts) / previousMonthProducts) * 100);

    res.json({
      revenue: {
        total: currentMonthRevenue,
        change: revenueChange
      },
      orders: {
        total: currentMonthOrders,
        change: ordersChange
      },
      customers: {
        total: totalCustomers,
        change: customersChange
      },
      products: {
        total: totalProducts,
        change: productsChange
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get monthly sales data for chart
 * @route GET /api/dashboard/sales
 * @access Private/Admin
 */
exports.getMonthlySales = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Get monthly sales for the current year
    const monthlySales = await Order.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total')), 'sales']
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31, 23, 59, 59, 999)]
        },
        status: {
          [Op.not]: 'cancelled'
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      raw: true
    });

    // Format data for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthNames.map((name, index) => {
      const monthData = monthlySales.find(item => parseInt(item.month) === index + 1);
      return {
        name,
        sales: monthData ? parseFloat(monthData.sales) : 0
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Monthly sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get recent orders
 * @route GET /api/dashboard/recent-orders
 * @access Private/Admin
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.findAll({
      include: [
        { 
          model: OrderItem,
          include: [Product]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Format orders for frontend
    const formattedOrders = recentOrders.map(order => {
      const totalItems = order.OrderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        id: order.id,
        user: order.userId,
        items: totalItems,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        recipientName: order.recipientName
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
