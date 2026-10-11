# 🛍️ ShopEase — Full Stack E-Commerce Website

A complete full-stack e-commerce web app built during the **Auspify Technologies Full Stack Development Internship** (Task 4). Users browse products, add them to a cart, and place orders. Passwords are hashed with bcrypt, sessions use JWT, and everything is responsive with a pastel-gradient UI.

---

## 📋 Overview

| Item | Details |
|------|---------|
| **Task** | Task 4 (Medium) — E-Commerce Website |
| **Intern** | Iman Zahra |
| **Company** | Auspify Technologies |
| **Stack** | React (Vite) · Node.js · Express · MySQL |

---

## ✨ Features

**Product Catalog**
- 8 seeded products with images, prices, categories, stock
- Live search + category filter chips

**Shopping Cart**
- Add to cart (auto-bumps qty if already present)
- Update quantity, remove items
- Cart badge showing item count in navbar
- Cart persists in MySQL across logout & refresh

**User Accounts**
- Register / login with hashed passwords (bcrypt, 10 rounds)
- JWT tokens (7-day expiry)
- Protected routes for cart & orders
- Session auto-restore on refresh

**Order Management**
- Checkout turns cart into an order (SQL transaction)
- Order history with item counts
- Order detail with `price_at_purchase` per line

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 (Vite), React Router, Axios, custom CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8 |
| **Auth** | JWT + bcrypt |

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── config/db.js              # MySQL pool + startup test
│   ├── middleware/auth.js        # JWT verifier
│   ├── routes/
│   │   ├── authRoutes.js         # register, login, me
│   │   ├── productRoutes.js      # list, filter, single
│   │   ├── cartRoutes.js         # add, update, remove, view
│   │   └── orderRoutes.js        # checkout, my orders, detail
│   ├── schema.sql                # rebuild database from scratch
│   ├── .env.example              # env template
│   ├── .gitignore
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/                  # axios instance + endpoint wrappers
│   │   ├── components/           # Navbar, Layout, ProtectedRoute
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/                # Home, ProductDetail, Cart, Orders, Login, Register
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── .gitignore
├── screenshots/
└── README.md
```

---

## 🗄️ Database Schema

**DB name:** `ecommerce_db`

| Table | Purpose |
|-------|---------|
| `users` | Customers + admins |
| `products` | Items for sale |
| `cart_items` | Live carts (unique per user+product) |
| `orders` | Placed orders |
| `order_items` | Products inside each order (with `price_at_purchase`) |

**Rebuild the DB with** `backend/schema.sql`.

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + DB health |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get token |
| GET | `/api/products` | List products (`?category=`, `?search=`) |
| GET | `/api/products/:id` | Single product |

### Protected (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Current user |
| GET / POST / PUT / DELETE | `/api/cart[/:id]` | Cart operations |
| POST / GET | `/api/orders[/:id]` | Checkout, list, detail |

---

## 🔐 Security

- bcrypt password hashing (10 rounds)
- JWT tokens (7-day expiry)
- All protected routes verify token via middleware
- Prepared statements (`?`) everywhere — SQL-injection safe
- Every cart/order query filters by `req.user.id` (data isolation)
- 404 (not 403) when accessing others' data
- `.env` files gitignored

---

## 🚀 Run Locally

```bash
# 1. Clone
git clone https://github.com/imanzahra-26/ecommerce-website.git
cd ecommerce-website

# 2. Database
# Paste backend/schema.sql into MySQL Workbench and run it.

# 3. Backend
cd backend
npm install
# copy .env.example → .env, fill in values
npm run dev            # http://localhost:5000

# 4. Frontend (new terminal)
cd ../frontend
npm install
# copy .env.example → .env
npm run dev            # http://localhost:5173
```

---

## 📸 Screenshots

See `screenshots/` for visual walkthroughs of every feature.

---

## 👤 Author

**Iman Zahra**
- Email: imanzahra2005@gmail.com
- LinkedIn: [linkedin.com/in/iman-zahra-28793a358](https://linkedin.com/in/iman-zahra-28793a358)
- GitHub: [github.com/imanzahra-26](https://github.com/imanzahra-26)

---

## 🏷️ Tags

#Auspify #AuspifyTechnologies #AuspifyInternship #AuspifyProjects #React #NodeJS #Express #MySQL #FullStack