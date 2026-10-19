const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export const formatPrice = (n) => vnd.format(n);

const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const formatDate = (value) => dateTime.format(new Date(value));
