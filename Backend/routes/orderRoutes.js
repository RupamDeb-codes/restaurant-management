const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ✅ GET: Admin - View all orders with menuItem populated and totalPrice included
router.get('/admin', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'items.menuItem',
        select: 'name price'
      })
      .sort({ createdAt: -1 });

    const safeOrders = orders.map(order => {
      const validItems = order.items.filter(item => item.menuItem && typeof item.menuItem.price === 'number');

      // Optional debug
      // console.log('🧾 Valid items:', validItems);

      const totalPrice = validItems.reduce((sum, item) => {
        const price = Number(item.menuItem.price || 0);
        const quantity = Number(item.quantity || 0);
        return sum + price * quantity;
      }, 0);

      return {
        ...order.toObject(),
        items: validItems,
        totalPrice
      };
    });

    res.json(safeOrders);
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

// ✅ PUT: Admin - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({
      path: 'items.menuItem',
      select: 'name price'
    });

    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order status updated', data: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
});

// ✅ GET: Track order by ID (safe version)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'items.menuItem',
      select: 'name price'
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const validItems = order.items.filter(item => item.menuItem && typeof item.menuItem.price === 'number');

    const totalPrice = validItems.reduce((sum, item) => {
      const price = Number(item.menuItem.price || 0);
      const quantity = Number(item.quantity || 0);
      return sum + price * quantity;
    }, 0);

    const safeOrder = {
      ...order.toObject(),
      items: validItems,
      totalPrice
    };

    res.status(200).json(safeOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// ✅ DELETE: Admin - Delete an order
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
