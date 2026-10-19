const { Pool, types } = require('pg');
require('dotenv').config();

// NUMERIC (oid 1700) mặc định trả về string; giá sản phẩm cần là number
types.setTypeParser(1700, parseFloat);

// Railway/cloud cấp sẵn DATABASE_URL; chạy local thì dùng các biến DB_* riêng lẻ
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

module.exports = pool;
