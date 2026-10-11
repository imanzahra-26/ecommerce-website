-- ShopEase database schema — run once in MySQL Workbench
CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  image_url    VARCHAR(500),
  category     VARCHAR(100),
  stock        INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  total_amount  DECIMAL(10,2) NOT NULL,
  status        ENUM('pending','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_id          INT NOT NULL,
  product_id        INT NOT NULL,
  quantity          INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Wireless Headphones','Bluetooth over-ear headphones with noise cancellation.',89.99,'https://picsum.photos/seed/headphones/600/400','Electronics',25),
('Mechanical Keyboard','RGB backlit mechanical keyboard with blue switches.',69.50,'https://picsum.photos/seed/keyboard/600/400','Electronics',40),
('Running Shoes','Lightweight running shoes for daily training.',54.00,'https://picsum.photos/seed/shoes/600/400','Footwear',60),
('Coffee Mug','Ceramic 350ml coffee mug, dishwasher safe.',12.99,'https://picsum.photos/seed/mug/600/400','Home',100),
('Notebook Set','Pack of 3 hardcover notebooks, dotted pages.',18.75,'https://picsum.photos/seed/notebook/600/400','Stationery',80),
('Desk Lamp','LED desk lamp with adjustable brightness.',27.40,'https://picsum.photos/seed/lamp/600/400','Home',35),
('Water Bottle','Stainless steel 750ml insulated bottle.',22.00,'https://picsum.photos/seed/bottle/600/400','Home',50),
('Backpack','Water-resistant 25L laptop backpack.',45.90,'https://picsum.photos/seed/backpack/600/400','Accessories',30);