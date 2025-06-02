// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  tags: [String]
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
