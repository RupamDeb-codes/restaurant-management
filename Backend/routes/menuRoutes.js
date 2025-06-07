const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order'); // ✅ Import Order model for analytics

// ✅ Test route
router.get('/test', (req, res) => {
  res.json({ message: '✅ Menu routes are connected properly' });
});

// ✅ POST: Add new menu item
router.post('/add', async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json({ message: 'Menu item added successfully!', data: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add menu item', details: error.message });
  }
});

// ✅ GET: Filter menu by category, spice, and diet
router.get('/', async (req, res) => {
  try {
    const { category, spice, diet } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const tags = [];

    if (spice === 'spicy') tags.push('spicy');
    if (spice === 'nonspicy') {
      filter.tags = { $nin: ['spicy'] };
    }

    if (diet === 'vegetarian') tags.push('vegetarian');
    if (diet === 'nonvegetarian') tags.push('non-vegetarian');

    if (tags.length > 0 && !filter.tags) {
      filter.tags = { $all: tags };
    } else if (tags.length > 0 && filter.tags && filter.tags.$nin) {
      filter.$and = [
        { tags: filter.tags }, // $nin
        { tags: { $all: tags } }
      ];
      delete filter.tags;
    }

    const items = await MenuItem.find(filter);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

// ✅ DELETE: Remove a menu item by ID
router.delete('/:id', async (req, res) => {
  console.log('DELETE route hit:', req.params.id);
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully', data: deletedItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item', details: error.message });
  }
});

// ✅ NEW: GET most ordered menu items
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
          from: 'menuitems', // Make sure this matches your MongoDB collection name
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          _id: 0,
          id: '$menuItem._id',
          name: '$menuItem.name',
          price: '$menuItem.price',
          category: '$menuItem.category',
          tags: '$menuItem.tags',
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
