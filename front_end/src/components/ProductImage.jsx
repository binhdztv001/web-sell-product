import { useState } from 'react';

// Hiện ảnh sản phẩm; không có ảnh hoặc ảnh lỗi thì hiện chữ cái đầu của tên
export default function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  if (!product.image_url || failed) {
    return <div className="thumb">{product.name.charAt(0).toUpperCase()}</div>;
  }
  return <img className="thumb" src={product.image_url} alt={product.name} onError={() => setFailed(true)} />;
}
