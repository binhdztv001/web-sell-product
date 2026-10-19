const pool = require('../config/db');
const httpError = require('../utils/httpError');

// Chạy fn trong một transaction: lỗi ở bất kỳ bước nào thì ROLLBACK toàn bộ
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Tạo đơn từ giỏ hàng: kiểm tra tồn kho, trừ kho, lưu đơn và xóa giỏ trong cùng một transaction
exports.checkout = (userId, { recipientName, phone, address, note }) =>
  transaction(async (client) => {
    // Khóa dòng giỏ và dòng sản phẩm: request khác (đặt trùng, người khác mua cùng sản phẩm)
    // phải chờ transaction này xong mới đọc được tồn kho mới
    const { rows: items } = await client.query(
      `SELECT ci.quantity, p.name, p.stock
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY p.id
       FOR UPDATE`,
      [userId]
    );
    if (items.length === 0) throw httpError(400, 'Giỏ hàng trống');

    const lacking = items.filter((i) => i.quantity > i.stock);
    if (lacking.length) {
      const detail = lacking.map((i) => `${i.name} (còn ${i.stock})`).join(', ');
      throw httpError(400, `Không đủ hàng trong kho: ${detail}`);
    }

    const { rows } = await client.query(
      `INSERT INTO orders (user_id, recipient_name, phone, address, note, total_amount)
       SELECT $1, $2, $3, $4, $5, SUM(p.price * ci.quantity)
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       RETURNING id`,
      [userId, recipientName, phone, address, note]
    );
    const orderId = rows[0].id;

    await client.query(
      `INSERT INTO order_items (order_id, product_id, product_name, image_url, price, quantity)
       SELECT $1, p.id, p.name, p.image_url, p.price, ci.quantity
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $2`,
      [orderId, userId]
    );
    await client.query(
      `UPDATE products p SET stock = p.stock - ci.quantity, updated_at = NOW()
       FROM cart_items ci
       WHERE ci.product_id = p.id AND ci.user_id = $1`,
      [userId]
    );
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    return orderId;
  });

// Danh sách đơn có lọc theo user/trạng thái và phân trang
exports.findAll = async ({ userId, status, page, limit }) => {
  const where = [];
  const params = [];
  if (userId) {
    params.push(userId);
    where.push(`o.user_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`o.status = $${params.length}`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: count } = await pool.query(`SELECT COUNT(*)::int AS total FROM orders o ${clause}`, params);
  const { rows } = await pool.query(
    `SELECT o.*, u.email AS user_email,
            (SELECT COALESCE(SUM(quantity), 0)::int FROM order_items WHERE order_id = o.id) AS total_quantity
     FROM orders o LEFT JOIN users u ON u.id = o.user_id
     ${clause}
     ORDER BY o.created_at DESC, o.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit]
  );
  return { items: rows, total: count[0].total };
};

exports.findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT o.*, u.email AS user_email
     FROM orders o LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [id]
  );
  if (!rows[0]) return undefined;
  const { rows: items } = await pool.query(
    `SELECT id, product_id, product_name, image_url, price, quantity, (price * quantity) AS subtotal
     FROM order_items WHERE order_id = $1 ORDER BY id`,
    [id]
  );
  return { ...rows[0], items };
};

// Đổi trạng thái đơn. check(order) ném lỗi nếu không được phép đổi.
// Hủy đơn thì hoàn lại tồn kho (bỏ qua sản phẩm đã bị xóa).
exports.changeStatus = (id, status, check) =>
  transaction(async (client) => {
    // Khóa đơn để hai request đổi trạng thái cùng lúc không hoàn kho hai lần
    const { rows } = await client.query('SELECT id, user_id, status FROM orders WHERE id = $1 FOR UPDATE', [id]);
    if (!rows[0]) return false;
    check(rows[0]);

    if (status === 'cancelled') {
      await client.query(
        `UPDATE products p SET stock = p.stock + oi.quantity, updated_at = NOW()
         FROM order_items oi
         WHERE oi.order_id = $1 AND oi.product_id = p.id`,
        [id]
      );
    }
    await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    return true;
  });
