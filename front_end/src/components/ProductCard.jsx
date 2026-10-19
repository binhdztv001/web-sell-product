import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="card">
      <ProductImage product={product} />
      <div className="card__body">
        <span className="card__cat">{product.category_name || 'Chưa phân loại'}</span>
        <span className="card__name">{product.name}</span>
        <span className="card__price">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
