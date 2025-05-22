require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const menuRoutes = require('./routes/menuRoutes');
app.use('/api/menu', menuRoutes);

console.log('Mongo URI:', process.env.MONGO_URI);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send('Restaurant Management API is running');
});

const PORT = process.env.PORT || 4000;
// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
