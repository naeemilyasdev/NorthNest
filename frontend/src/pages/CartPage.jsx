import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { formatPrice } from '../utils/formatters';

export const CartPage = () => {
  const { cart, loading, fetchCart, updateCartItem, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <p className="mb-4 text-ink/80 dark:text-accent/80">Please login to view your cart</p>
        <Link to="/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <Loading />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-ink/20 dark:text-accent/20 mb-4" />
        <h2 className="font-display text-3xl font-semibold mb-3 text-ink dark:text-accent">Your cart is empty</h2>
        <p className="mb-6 text-ink/80 dark:text-accent/80">Add a few Himalayan essentials to see them here.</p>
        <Link to="/products" className="btn-primary">
          Explore Products
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = cart.total || 0;
  const shippingCost = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container">
        <div className="mb-4">
          <BackButton fallbackPath="/products" />
        </div>
        <div className="mb-8 card p-8">
          <p className="section-label mb-2">Cart</p>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-2">Your Shopping Cart</h1>
          <p className="text-ink/80 dark:text-accent/80">Review and update your items before checkout.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.9fr_1fr]">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = item.product || (typeof item.productId === 'object' ? item.productId : null);
              const productId = product?._id || item.productId;
              const normalizedKey = String(productId);
              const itemTotal = (product?.price ?? item.price ?? 0) * item.quantity;

              return (
                <div key={normalizedKey} className="card border-2 border-ink/10 p-5 transition hover:border-secondary/30 dark:border-accent/10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={product?.image || '/placeholder-product.jpg'}
                        alt={product?.name || 'Product'}
                        className="h-28 w-28 object-cover border-2 border-ink/10 dark:border-accent/10"
                      />
                      <div>
                        <Link to={`/products/${productId}`} className="font-display text-lg font-semibold text-ink hover:text-secondary dark:text-accent">
                          {product?.name || 'Product'}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-wider text-ink/70 dark:text-accent/70">{product?.category || 'Natural product'}</p>
                        <p className="mt-3 font-display text-lg font-semibold text-secondary">{formatPrice(product?.price ?? item.price ?? 0)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex items-center gap-2 border-2 border-ink/10 px-3 py-2 dark:border-accent/10">
                        <label className="text-xs font-semibold uppercase tracking-wider text-ink/80 dark:text-accent/80">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(productId, parseInt(e.target.value, 10) || 1)}
                          className="w-16 border-2 border-ink/20 bg-surface px-2 py-1 text-center text-sm outline-none focus:border-secondary dark:border-accent/20 dark:bg-ink/60 dark:text-accent"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => removeFromCart(productId)} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-error transition hover:text-red-600">
                          <Trash2 size={12} /> Remove
                        </button>
                        <p className="text-xs text-ink/70 dark:text-accent/70">Total: {formatPrice(itemTotal)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-8">
            <h2 className="font-display text-2xl font-semibold mb-6 text-ink dark:text-accent">Order Summary</h2>
            <div className="space-y-4 text-sm text-ink/80 dark:text-accent/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="divider my-6" />

            <div className="flex items-center justify-between text-lg font-semibold text-ink dark:text-accent">
              <span>Total</span>
              <span className="font-display text-secondary">{formatPrice(total)}</span>
            </div>

            <Button onClick={handleCheckout} className="w-full mt-8">
              Proceed to Checkout
            </Button>
            <Link to="/products" className="btn-outline mt-4 inline-flex w-full justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

