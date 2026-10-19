import ProductImage from './ProductImage';
import { formatDate, formatPrice } from '../utils/format';
import { StatusBadge } from '../utils/order';

// Thông tin giao hàng + danh sách sản phẩm của một đơn; dùng chung cho trang user và admin
export default function OrderInfo({ order }) {
  return (
    <>
      <div className="order-info">
        <div><span>Trạng thái</span><StatusBadge status={order.status} /></div>
        <div><span>Ngày đặt</span>{formatDate(order.created_at)}</div>
        <div><span>Người nhận</span>{order.recipient_name}</div>
        <div><span>Số điện thoại</span>{order.phone}</div>
        <div><span>Địa chỉ</span>{order.address}</div>
        {order.note && <div><span>Ghi chú</span>{order.note}</div>}
      </div>

      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-item__img">
              <ProductImage product={{ name: item.product_name, image_url: item.image_url }} />
            </div>
            <div className="order-item__name">
              {item.product_name}
              <small>{formatPrice(item.price)} × {item.quantity}</small>
            </div>
            <strong>{formatPrice(item.subtotal)}</strong>
          </div>
        ))}
        <div className="cart__row cart__row--total">
          <span>Tổng cộng</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </>
  );
}
