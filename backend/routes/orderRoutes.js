// ============================================
// ORDER ROUTES — all PROTECTED (login required)
// ============================================
// Handles checkout, listing my orders, and viewing a single order.

const express = require('express');
const router = express.Router();

// MySQL pool
const pool = require('../config/db');

// JWT-verifying middleware — applied to every route below
const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

// ============================================
// POST /api/orders   (CHECKOUT)
// ============================================
// Turns the current user's cart into an order.
// Steps:
//   1. Get cart items joined with product prices
//   2. Compute total
//   3. Insert into `orders`            → get order id
//   4. Insert one row per item into `order_items`
//   5. Clear the cart
// All inside a TRANSACTION so nothing half-completes.
router.post('/', async (req, res) => {
  // Get a dedicated connection (transactions need one connection, not pool.query)
  const conn = await pool.getConnection();

  try {
    // Begin transaction — all queries below are provisional until COMMIT
    await conn.beginTransaction();

    // 1. Read the user's cart joined with product info
    const [cartRows] = await conn.query(
      `SELECT
         c.product_id,
         c.quantity,
         p.price
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    // If the cart is empty, we can't place an order
    if (cartRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Compute the order total
    const total = cartRows.reduce(
      (sum, r) => sum + Number(r.price) * r.quantity,
      0
    );

    // 3. Insert the order row
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.id, total.toFixed(2), 'pending']
    );
    const orderId = orderResult.insertId;

    // 4. Insert one order_items row per cart line
    //    Build a multi-row VALUES list for efficiency
    const itemValues = cartRows.map((r) => [orderId, r.product_id, r.quantity, r.price]);
    await conn.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?',
      [itemValues]
    );

    // 5. Empty the user's cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    // Commit — all changes become permanent
    await conn.commit();

    // Return the new order
    res.status(201).json({
      message: 'Order placed',
      order_id: orderId,
      total: Number(total.toFixed(2))
    });

  } catch (err) {
    // Something failed — undo everything
    await conn.rollback();
    console.error('Checkout error:', err.message);
    res.status(500).json({ message: 'Server error during checkout' });
  } finally {
    // Always return the connection to the pool
    conn.release();
  }
});

// ============================================
// GET /api/orders
// ============================================
// Lists the logged-in user's orders, newest first.
// Also includes an item_count for each order (nice for the UI).
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         o.id,
         o.total_amount,
         o.status,
         o.created_at,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error('Orders list error:', err.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// ============================================
// GET /api/orders/:id
// ============================================
// Returns one order's full details + its line items.
// Only if it belongs to the logged-in user.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the order (and check ownership)
    const [orderRows] = await pool.query(
      'SELECT id, total_amount, status, created_at FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Fetch the line items with product details
    const [itemRows] = await pool.query(
      `SELECT
         oi.id,
         oi.product_id,
         oi.quantity,
         oi.price_at_purchase,
         (oi.quantity * oi.price_at_purchase) AS line_total,
         p.name,
         p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ order: orderRows[0], items: itemRows });
  } catch (err) {
    console.error('Order detail error:', err.message);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

module.exports = router;