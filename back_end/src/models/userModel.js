const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, full_name, email, role, created_at';

exports.findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

exports.findById = async (id) => {
  const { rows } = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id]);
  return rows[0];
};

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY created_at DESC, id DESC`
  );
  return rows;
};

// passwordHash là tùy chọn: không truyền thì giữ nguyên mật khẩu cũ
exports.update = async (id, { fullName, email, role, passwordHash }) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET full_name = $1, email = $2, role = $3,
         password_hash = COALESCE($4, password_hash), updated_at = NOW()
     WHERE id = $5 RETURNING ${PUBLIC_FIELDS}`,
    [fullName, email, role, passwordHash || null, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
};

exports.create = async ({ fullName, email, passwordHash, role = 'user' }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_FIELDS}`,
    [fullName, email, passwordHash, role]
  );
  return rows[0];
};
