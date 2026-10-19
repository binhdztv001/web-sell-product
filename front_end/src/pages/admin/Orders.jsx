import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import OrderInfo from '../../components/OrderInfo';
import Pagination from '../../components/Pagination';
import { formatDate, formatPrice } from '../../utils/format';
import { NEXT_STATUS, ORDER_STATUS, StatusBadge } from '../../utils/order';

export default function Orders() {
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/orders', { params: { page, status: status || undefined } }).then((res) => setData(res.data));

  useEffect(() => {
    load();
  }, [page, status]);

  const open = async (o) => {
    setError('');
    setViewing((await api.get(`/orders/${o.id}`)).data);
  };

  const changeStatus = async (next) => {
    if (next === 'cancelled' && !window.confirm('Hủy đơn này? Tồn kho sẽ được hoàn lại.')) return;
    try {
      setViewing((await api.patch(`/orders/${viewing.id}/status`, { status: next })).data);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Đơn hàng</h1>
        <select
          className="filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Mã</th><th>Khách hàng</th><th>Ngày đặt</th><th>SL</th><th>Tổng tiền</th><th>Trạng thái</th><th /></tr>
          </thead>
          <tbody>
            {data.items.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  {o.recipient_name}
                  <br />
                  <small className="muted">{o.user_email || 'Tài khoản đã xóa'}</small>
                </td>
                <td>{formatDate(o.created_at)}</td>
                <td>{o.total_quantity}</td>
                <td>{formatPrice(o.total_amount)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => open(o)}>Chi tiết</button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan={7} className="empty">Chưa có đơn hàng nào</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      {viewing && (
        <Modal title={`Đơn hàng #${viewing.id}`} onClose={() => setViewing(null)}>
          {error && <div className="alert alert--error">{error}</div>}
          <OrderInfo order={viewing} />
          <div className="modal__footer">
            {NEXT_STATUS[viewing.status].map((next) => (
              <button
                key={next}
                className={`btn btn--sm ${next === 'cancelled' ? 'btn--danger' : ''}`}
                onClick={() => changeStatus(next)}
              >
                {next === 'cancelled' ? 'Hủy đơn' : `→ ${ORDER_STATUS[next]}`}
              </button>
            ))}
            <button className="btn btn--ghost btn--sm" onClick={() => setViewing(null)}>Đóng</button>
          </div>
        </Modal>
      )}
    </>
  );
}
