import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import OrderInfo from '../components/OrderInfo';

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được đơn hàng'));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      setOrder((await api.patch(`/orders/${id}/cancel`)).data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy đơn');
    }
  };

  if (!order) {
    return <div className="container">{error && <div className="alert alert--error">{error}</div>}</div>;
  }

  return (
    <div className="container container--narrow">
      <div className="page-head">
        <h1>Đơn hàng #{order.id}</h1>
        <Link to="/orders">← Đơn hàng của tôi</Link>
      </div>
      {state?.placed && <div className="alert alert--success">Đặt hàng thành công! Cảm ơn bạn đã mua sắm.</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <div className="cart__summary">
        <OrderInfo order={order} />
        {order.status === 'pending' && (
          <button className="btn btn--danger btn--block" onClick={handleCancel}>
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  );
}
