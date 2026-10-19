const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalLimiter } = require('./middlewares/rateLimit');
require('dotenv').config();

const app = express();

// Railway đặt server sau 1 lớp proxy: tin header X-Forwarded-For của proxy đó để lấy IP thật
// của người dùng, nếu không rate limit sẽ coi mọi người là chung một IP
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', globalLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  // Lỗi upload của multer (file quá lớn, sai tên field...)
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh không được lớn hơn 5MB' : 'File upload không hợp lệ';
    return res.status(400).json({ message });
  }
  // Lỗi PostgreSQL thường gặp -> trả mã HTTP phù hợp thay vì 500
  const pgErrors = {
    '23505': [409, 'Dữ liệu đã tồn tại (trùng giá trị duy nhất)'],
    '23503': [400, 'Dữ liệu tham chiếu không tồn tại'],
    '22P02': [400, 'Tham số không hợp lệ'],
    '22003': [400, 'Giá trị vượt quá giới hạn cho phép'],
    '22001': [400, 'Dữ liệu quá dài'],
  };
  if (pgErrors[err.code]) {
    return res.status(pgErrors[err.code][0]).json({ message: pgErrors[err.code][1] });
  }
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error' });
});

module.exports = app;
