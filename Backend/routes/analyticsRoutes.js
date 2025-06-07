const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

router.get('/sales-daily', async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuInfo'
        }
      },
      { $unwind: '$menuInfo' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: {
            $sum: { $multiply: ['$items.quantity', '$menuInfo.price'] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily sales', details: err.message });
  }
});
// ✅ 2. Most Ordered Dishes (Top 5)
router.get('/most-ordered', async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalOrdered: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          _id: 0,
          name: '$menuItem.name',
          totalOrdered: 1
        }
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch most ordered items', details: err.message });
  }
});

// ✅ 3. Revenue by Category (Pie Chart)
router.get('/category-revenue', async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuInfo'
        }
      },
      { $unwind: '$menuInfo' },
      {
        $group: {
          _id: '$menuInfo.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$menuInfo.price'] } }
        }
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue by category', details: err.message });
  }
});

// ✅ 4. Peak Ordering Hours (Line Chart)
router.get('/peak-hours', async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch peak ordering hours', details: err.message });
  }
});

module.exports = router;
