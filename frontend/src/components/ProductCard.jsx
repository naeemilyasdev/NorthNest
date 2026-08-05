import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { isInWishlist, toggleWishlist } from '../utils/wishlist';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatters';

export const ProductCard = ({ product, onAddToCart, onWishlistToggle }) => {
  const navigate = useNavigate();
  const id = product._id ?? product.id;
  const inWishlist = isInWishlist(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(id);
    if (typeof onWishlistToggle === 'function') onWishlistToggle(id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  const price = formatPrice(product.price || 0);

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl bg-surface shadow-sm transition hover:shadow-md dark:bg-ink/40"
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40" />

        <button
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-10 rounded-full p-2 transition ${
            inWishlist
              ? 'bg-secondary text-white shadow'
              : 'bg-white/90 text-ink shadow-sm hover:bg-secondary hover:text-white'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute left-3 top-3 rounded-full bg-parchment/90 px-3 py-1 text-xs font-semibold text-ink">{product.category}</div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold leading-tight text-ink dark:text-accent">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/80 dark:text-accent/80">{product.description}</p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="font-display text-xl font-semibold text-secondary">{price}</span>
          {onAddToCart && !isAdmin && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
            >
              <ShoppingBag size={14} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

