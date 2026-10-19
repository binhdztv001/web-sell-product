// Chạy: npm run db:setup
// Tạo database (nếu chưa có), tạo bảng và tài khoản admin đầu tiên.
// Chạy lại nhiều lần vẫn an toàn (IF NOT EXISTS / ON CONFLICT DO NOTHING) nên dùng được làm pre-deploy command.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { DATABASE_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const conn = { host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD };

async function main() {
  // 1. Tạo database nếu chưa tồn tại (chỉ khi chạy local; trên cloud database đã có sẵn trong DATABASE_URL)
  if (!DATABASE_URL) {
    const admin = new Client({ ...conn, database: 'postgres' });
    await admin.connect();
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (!rowCount) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Đã tạo database "${DB_NAME}"`);
    } else {
      console.log(`Database "${DB_NAME}" đã tồn tại`);
    }
    await admin.end();
  }

  // 2. Tạo bảng
  const db = new Client(DATABASE_URL ? { connectionString: DATABASE_URL } : { ...conn, database: DB_NAME });
  await db.connect();
  await db.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log('Đã tạo các bảng');

  // 3. Tạo admin đầu tiên
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const res = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING`,
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );
  console.log(res.rowCount ? `Đã tạo admin: ${ADMIN_EMAIL}` : 'Admin đã tồn tại');
  await db.end();
}

main().catch((err) => {
  console.error('Setup thất bại:', err.message);
  process.exit(1);
});
