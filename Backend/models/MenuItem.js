// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  tags: [String],
  available: {
    type: Boolean,
    default: true  // All new items are available by default
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
