const pool = require('../config/db');

exports.findByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ci.id, ci.product_id, ci.quantity,
            p.name, p.price, p.image_url, p.stock,
            (p.price * ci.quantity) AS subtotal
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at, ci.id`,
    [userId]
  );
  return rows;
};

exports.getProduct = async (productId) => {
  const { rows } = await pool.query('SELECT id, stock FROM products WHERE id = $1', [productId]);
  return rows[0];
};

exports.getQuantity = async (userId, productId) => {
  const { rows } = await pool.query(
    'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return rows[0]?.quantity;
};

// Cộng dồn số lượng, chỉ thành công nếu tổng không vượt tồn kho. Trả về true/false.
exports.add = async (userId, productId, quantity) => {
  const { rowCount } = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     SELECT $1, p.id, $3 FROM products p WHERE p.id = $2 AND p.stock >= $3
     ON CONFLICT (user_id, product_id) DO UPDATE
       SET quantity = cart_items.quantity + EXCLUDED.quantity
       WHERE cart_items.quantity + EXCLUDED.quantity <= (SELECT stock FROM products WHERE id = $2)`,
    [userId, productId, quantity]
  );
  return rowCount > 0;
};

// Đặt số lượng mới, chỉ thành công nếu mục đã có trong giỏ và không vượt tồn kho
exports.setQuantity = async (userId, productId, quantity) => {
  const { rowCount } = await pool.query(
    `UPDATE cart_items ci SET quantity = $3
     FROM products p
     WHERE ci.user_id = $1 AND ci.product_id = $2 AND p.id = ci.product_id AND p.stock >= $3`,
    [userId, productId, quantity]
  );
  return rowCount > 0;
};

exports.remove = async (userId, productId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return rowCount > 0;
};

exports.clear = async (userId) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};
