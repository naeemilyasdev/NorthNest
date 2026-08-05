import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/overview', protect, authorize('admin'), async (req, res, next) => {
  try {
    const now = new Date();
    const recentDays = 30;
    const recentStart = new Date(now);
    recentStart.setDate(recentStart.getDate() - recentDays);
    const previousStart = new Date(recentStart);
    previousStart.setDate(previousStart.getDate() - recentDays);

    const totalCustomers = await User.countDocuments({ role: 'user' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);

    const recentRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: recentStart } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]);

    const previousRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lt: recentStart } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]);

    const recentCustomerResult = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: recentStart } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const previousCustomerResult = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: previousStart, $lt: recentStart } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const recentRevenue = recentRevenueResult[0]?.revenue || 0;
    const previousRevenue = previousRevenueResult[0]?.revenue || 0;
    const recentCustomers = recentCustomerResult[0]?.count || 0;
    const previousCustomers = previousCustomerResult[0]?.count || 0;

    const revenueGrowth = previousRevenue === 0 ? (recentRevenue === 0 ? 0 : 100) : Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100);
    const customerGrowth = previousCustomers === 0 ? (recentCustomers === 0 ? 0 : 100) : Math.round(((recentCustomers - previousCustomers) / previousCustomers) * 100);
    const growthPercentage = Math.round((revenueGrowth + customerGrowth) / 2);

    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      data: {
        totalCustomers,
        lowStockProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
        orderStatusCounts,
        recentOrders,
        growthPercentage,
        recentRevenue,
        recentCustomers,
        revenueGrowth,
        customerGrowth,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/customers', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('firstName lastName email createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((user) => user._id);
    const orderCounts = await Order.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const orderCountMap = orderCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const inactiveThreshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const customers = users.map((user) => {
      const lastActive = user.lastLogin || user.createdAt;
      const status = lastActive && lastActive < inactiveThreshold ? 'Inactive' : 'Active';
      return {
        ...user,
        status,
        orderCount: orderCountMap[user._id.toString()] || 0,
      };
    });

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
});

export default router;