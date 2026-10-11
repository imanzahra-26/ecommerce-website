// ============================================
// PRODUCT ROUTES — list products + single product
// ============================================
// These routes are PUBLIC (no auth needed).
// Anyone can browse the shop without logging in.

// Express router
const express = require('express');
const router = express.Router();

// Our MySQL pool
const pool = require('../config/db');

// ============================================
// GET /api/products
// ============================================
// Returns a list of products.
// Supports two optional filters via query string:
//   ?category=Electronics   → only that category
//   ?search=keyboard        → name OR description contains this word
// Example: /api/products?category=Home&search=mug
router.get('/', async (req, res) => {
  try {
    // Read optional query params from the URL
    const { category, search } = req.query;

    // Start with a base SQL query
    let sql = 'SELECT id, name, description, price, image_url, category, stock FROM products WHERE 1=1';
    // "WHERE 1=1" is a neat trick — it's always true, so we can safely
    // append "AND ..." clauses below without worrying about the first one.

    // Array of values to bind to the ? placeholders (order matters!)
    const params = [];

    // If a category filter was sent, add it
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // If a search term was sent, match against name OR description
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      // LIKE with % around it means "contains" — %keyboard% matches any text with "keyboard"
      const likeTerm = `%${search}%`;
      params.push(likeTerm, likeTerm);
    }

    // Show newest first
    sql += ' ORDER BY created_at DESC';

    // Run the query with prepared-statement bindings
    const [rows] = await pool.query(sql, params);

    // Send the products back as JSON
    res.json({ count: rows.length, products: rows });

  } catch (err) {
    console.error('Products list error:', err.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// ============================================
// GET /api/products/:id
// ============================================
// Returns one product by its id.
// Example: /api/products/3
router.get('/:id', async (req, res) => {
  try {
    // Read the id from the URL (it comes as a string — MySQL will coerce)
    const { id } = req.params;

    // Look up the product
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url, category, stock FROM products WHERE id = ?',
      [id]
    );

    // If nothing was found, return 404
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Send the product
    res.json({ product: rows[0] });

  } catch (err) {
    console.error('Product detail error:', err.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Export the router
module.exports = router;