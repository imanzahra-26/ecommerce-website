// ============================================
// CART ROUTES — all PROTECTED (login required)
// ============================================
// Every route here uses authMiddleware, so req.user.id is set.
// Every query filters by that id — users can NEVER touch each other's carts.

const express = require('express');
const router = express.Router();

// MySQL pool
const pool = require('../config/db');

// Our JWT-verifying middleware
const authMiddleware = require('../middleware/auth');

// Apply authMiddleware to EVERY route in this file
// Instead of writing it on each route, we do it once here.
router.use(authMiddleware);

// ============================================
// HELPER — get one cart line joined with product info
// ============================================
// We use this after insert/update so the frontend gets back
// the same shape as the GET /cart list item.
async function getCartLine(cartId, userId) {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.quantity,
       c.product_id,
       p.name,
       p.price,
       p.image_url,
       p.category,
       p.stock,
       (c.quantity * p.price) AS line_total
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     WHERE c.id = ? AND c.user_id = ?`,
    [cartId, userId]
  );
  return rows[0] || null;
}

// ============================================
// GET /api/cart
// ============================================
// Returns all cart lines for the logged-in user.
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.quantity,
         c.product_id,
         p.name,
         p.price,
         p.image_url,
         p.category,
         p.stock,
         (c.quantity * p.price) AS line_total
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    // Compute the grand total on the server (frontend can also do it, but nice to have)
    const total = rows.reduce((sum, r) => sum + Number(r.line_total), 0);

    res.json({ items: rows, total });
  } catch (err) {
    console.error('Cart list error:', err.message);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// ============================================
// POST /api/cart
// ============================================
// Body: { product_id, quantity }
// Adds a product to the cart. If it's already there, quantity is bumped.
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Validate
    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'product_id and quantity (>=1) are required' });
    }

    // Check the product exists (and prevent adding fake ids)
    const [prodRows] = await pool.query(
      'SELECT id, stock FROM products WHERE id = ?',
      [product_id]
    );
    if (prodRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optional sanity check — don't let cart quantity exceed stock
    if (quantity > prodRows[0].stock) {
      return res.status(400).json({ message: `Only ${prodRows[0].stock} in stock` });
    }

    // Insert OR update if (user_id, product_id) already exists.
    // "ON DUPLICATE KEY UPDATE" fires when the UNIQUE (user_id, product_id) clashes.
    const [result] = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    // If it was an UPDATE, insertId is 0 and we need to look up the existing cart row id.
    let cartId = result.insertId;
    if (!cartId) {
      const [existing] = await pool.query(
        'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, product_id]
      );
      cartId = existing[0].id;
    }

    // Fetch the full joined row and return it
    const line = await getCartLine(cartId, req.user.id);
    res.status(201).json({ message: 'Added to cart', item: line });
  } catch (err) {
    console.error('Cart add error:', err.message);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// ============================================
// PUT /api/cart/:id
// ============================================
// Body: { quantity }
// Updates the quantity of one cart line (must belong to the user).
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'quantity (>=1) is required' });
    }

    // Make sure the cart line belongs to this user AND grab the product stock
    const [rows] = await pool.query(
      `SELECT c.id, p.stock
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity > rows[0].stock) {
      return res.status(400).json({ message: `Only ${rows[0].stock} in stock` });
    }

    // Update quantity
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, req.user.id]
    );

    const line = await getCartLine(id, req.user.id);
    res.json({ message: 'Cart updated', item: line });
  } catch (err) {
    console.error('Cart update error:', err.message);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// ============================================
// DELETE /api/cart/:id
// ============================================
// Removes one cart line (must belong to the user).
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Removed from cart' });
  } catch (err) {
    console.error('Cart delete error:', err.message);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

module.exports = router;