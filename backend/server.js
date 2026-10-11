// ============================================
// MAIN SERVER FILE (Express)
// ============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');   // ← new

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// ROUTES
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'unreachable', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);                    // ← new

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});