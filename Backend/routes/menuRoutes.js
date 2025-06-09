const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const verifyToken = require('./authMiddleware'); // ✅ Middleware to verify Firebase token

// ✅ Test route
router.get('/test', (req, res) => {
  res.json({ message: '✅ Menu routes are connected properly' });
});

// ✅ PROTECTED: Add new menu item
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { name, category, price, tags = [], available = true } = req.body;

    if (!name || !category || typeof price !== 'number') {
      return res.status(400).json({ error: 'Name, category, and price are required fields' });
    }

    const newItem = new MenuItem({ name, category, price, tags, available });
    await newItem.save();
    res.status(201).json({ message: 'Menu item added successfully!', data: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add menu item', details: error.message });
  }
});

// ✅ CUSTOMER: Get available menu items (no auth required)
router.get('/', async (req, res) => {
  try {
    const { category, spice, diet } = req.query;
    const filter = { available: true };
    const tagConditions = [];

    if (category) filter.category = category;
    if (spice === 'spicy') tagConditions.push('spicy');
    if (spice === 'nonspicy') filter.tags = { $nin: ['spicy'] };
    if (diet === 'vegetarian') tagConditions.push('vegetarian');
    if (diet === 'nonvegetarian') tagConditions.push('non-vegetarian');

    if (tagConditions.length && !filter.tags) {
      filter.tags = { $all: tagConditions };
    } else if (tagConditions.length && filter.tags?.$nin) {
      filter.$and = [
        { tags: filter.tags }, // $nin
        { tags: { $all: tagConditions } } // $all
      ];
      delete filter.tags;
    }

    const items = await MenuItem.find(filter);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

// ✅ PROTECTED: Admin fetch all
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all menu items', details: error.message });
  }
});

// ✅ PROTECTED: Update a menu item by ID
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item updated successfully!', data: updatedItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item', details: error.message });
  }
});

// ✅ PROTECTED: Delete a menu item by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully', data: deletedItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item', details: error.message });
  }
});

// ✅ Get most ordered items (public)
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
      { $limit: 10 },
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
          id: '$menuItem._id',
          name: '$menuItem.name',
          category: '$menuItem.category',
          price: '$menuItem.price',
          tags: '$menuItem.tags',
          available: '$menuItem.available',
          totalOrdered: 1
        }
      }
    ]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch most ordered items', details: error.message });
  }
});

module.exports = router;
