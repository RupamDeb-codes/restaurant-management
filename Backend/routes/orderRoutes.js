const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ✅ Admin: View all orders — must come before '/:id'
router.get('/admin', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// ✅ POST: Place a new order
router.post('/place', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Order placed!', data: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// ✅ Admin: Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.menuItem');

    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order status updated', data: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
});

// ✅ Track order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// ✅ Admin: Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted', data: deletedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

module.exports = router;
