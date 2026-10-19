const pool = require('../config/db');

const SELECT = `
  SELECT p.*, c.name AS category_name
  FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

// Hỗ trợ lọc theo danh mục, tìm theo tên và phân trang
exports.findAll = async ({ categoryId, search, page, limit }) => {
  const where = [];
  const params = [];
  if (categoryId) {
    params.push(categoryId);
    where.push(`p.category_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`p.name ILIKE $${params.length}`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: count } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products p ${clause}`,
    params
  );
  const { rows } = await pool.query(
    `${SELECT} ${clause} ORDER BY p.created_at DESC, p.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit]
  );
  return { items: rows, total: count[0].total };
};

exports.findById = async (id) => {
  const { rows } = await pool.query(`${SELECT} WHERE p.id = $1`, [id]);
  return rows[0];
};

exports.create = async ({ categoryId, name, description, price, stock, imageUrl }) => {
  const { rows } = await pool.query(
    `INSERT INTO products (category_id, name, description, price, stock, image_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [categoryId, name, description, price, stock, imageUrl]
  );
  return exports.findById(rows[0].id);
};

exports.update = async (id, { categoryId, name, description, price, stock, imageUrl }) => {
  const { rowCount } = await pool.query(
    `UPDATE products
     SET category_id = $1, name = $2, description = $3, price = $4, stock = $5,
         image_url = $6, updated_at = NOW()
     WHERE id = $7`,
    [categoryId, name, description, price, stock, imageUrl, id]
  );
  return rowCount ? exports.findById(id) : undefined;
};

exports.isImageInOrders = async (imageUrl) => {
  const { rowCount } = await pool.query('SELECT 1 FROM order_items WHERE image_url = $1 LIMIT 1', [imageUrl]);
  return rowCount > 0;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
};
