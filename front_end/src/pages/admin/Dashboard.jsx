import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/categories'),
      api.get('/products', { params: { limit: 1 } }),
      api.get('/orders', { params: { limit: 1 } }),
      api.get('/orders', { params: { limit: 1, status: 'pending' } }),
    ]).then(([u, c, p, o, pending]) =>
      setStats({
        users: u.data.length,
        categories: c.data.length,
        products: p.data.total,
        orders: o.data.total,
        pending: pending.data.total,
      })
    );
  }, []);

  return (
    <>
      <div className="page-head">
        <h1>Tổng quan</h1>
      </div>
      <div className="stats">
        <Link to="/admin/users"><strong>{stats.users ?? '-'}</strong><span>Người dùng</span></Link>
        <Link to="/admin/categories"><strong>{stats.categories ?? '-'}</strong><span>Danh mục</span></Link>
        <Link to="/admin/products"><strong>{stats.products ?? '-'}</strong><span>Sản phẩm</span></Link>
        <Link to="/admin/orders"><strong>{stats.orders ?? '-'}</strong><span>Đơn hàng</span></Link>
        <Link to="/admin/orders"><strong>{stats.pending ?? '-'}</strong><span>Đơn chờ xác nhận</span></Link>
      </div>
    </>
  );
}
