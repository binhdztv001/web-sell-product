import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import { formatDate, formatPrice } from '../utils/format';
import { StatusBadge } from '../utils/order';

export default function Orders() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/orders/my', { params: { page } }).then((res) => setData(res.data));
  }, [page]);

  if (!data) return null;

  return (
    <div className="container">
      <h1>Đơn hàng của tôi</h1>
      {data.items.length === 0 ? (
        <p className="empty">
          Bạn chưa có đơn hàng nào. <Link to="/products">Mua sắm ngay</Link>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Mã đơn</th><th>Ngày đặt</th><th>Số lượng</th><th>Tổng tiền</th><th>Trạng thái</th><th /></tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.total_quantity}</td>
                  <td>{formatPrice(o.total_amount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="table__actions">
                    <Link to={`/orders/${o.id}`} className="btn btn--ghost btn--sm">Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
