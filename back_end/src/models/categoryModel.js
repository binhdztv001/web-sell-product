const pool = require('../config/db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.name`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0];
};

exports.create = async ({ name, description }) => {
  const { rows } = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
  return rows[0];
};

exports.update = async (id, { name, description }) => {
  const { rows } = await pool.query(
    'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return rowCount > 0;
};
