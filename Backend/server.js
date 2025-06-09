require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ Initialize app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Import routes
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// ✅ Use routes
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🍽️ Restaurant Management API is running');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
