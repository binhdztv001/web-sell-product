require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

pool
  .query('SELECT 1')
  .then(() => {
    console.log('Đã kết nối PostgreSQL');
    app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Không kết nối được database:', err.message);
    process.exit(1);
  });
