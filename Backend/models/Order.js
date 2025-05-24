const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: String,
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      quantity: Number,
      notes: String
    }
  ],
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Ready', 'Delivered'],
    default: 'Placed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
