export const ORDER_STATUS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

// Giống TRANSITIONS ở back_end; dùng để hiện các nút chuyển trạng thái hợp lệ
export const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{ORDER_STATUS[status]}</span>;
}
