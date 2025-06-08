// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  ingredients: [String],
  tags: [String],
  available: Boolean
});


module.exports = mongoose.model('MenuItem', MenuItemSchema);
