import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';
import { showToast } from '../utils/toast';
import { formatPrice } from '../utils/formatters';
import { PAYMENT_METHODS } from '../config/constants.js';
import { clearWishlist } from '../utils/wishlist';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
      zipCode: user?.address?.zipCode || '',
    },
    paymentMethod: PAYMENT_METHODS[0]?.value || 'cod',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paymentMethod') {
      setFormData((prev) => ({ ...prev, paymentMethod: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: { ...prev.shippingAddress, [name]: value },
      }));
    }
  };

  const normalizeProductId = (value) => {
    if (value == null) return '';
    if (typeof value === 'object') {
      return value._id || value.id || '';
    }
    return String(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart?.items?.length) {
      showToast('Your cart is empty. Add items before checkout.', 'error');
      return;
    }

    try {
      setLoading(true);
      const orderItems = cart.items
        .map((item) => {
          const product = item.product || (typeof item.productId === 'object' ? item.productId : null);
          const productId = normalizeProductId(product?._id || product?.id || item.productId);

          return {
            productId,
            quantity: item.quantity,
          };
        })
        .filter((item) => item.productId);

      const orderData = {
        items: orderItems,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
      };

      const response = await orderService.createOrder(orderData);
      showToast('Order placed successfully', 'success');
      clearWishlist();
      await clearCart();
      navigate(`/orders/${response.data._id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Order failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart?.total || 0;
  const shippingCost = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shippingCost + tax;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="mb-4 text-lg text-ink/80 dark:text-accent/80">No items found in your cart.</p>
        <Button type="button" onClick={() => navigate('/products')} className="mx-auto">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-280px)] py-12">
      <div className="container max-w-6xl">
        <div className="mb-4">
          <BackButton fallbackPath="/cart" />
        </div>
        <div className="mb-8 card p-8">
          <p className="section-label mb-2">Checkout</p>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-2">Secure Checkout</h1>
          <p className="text-ink/80 dark:text-accent/80">Review your order and confirm shipping details before placing your purchase.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="card p-8">
              <h2 className="font-display text-2xl font-semibold mb-5 text-ink dark:text-accent">Shipping Address</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Street Address"
                    name="street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="City"
                    name="city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="State"
                    name="state"
                    value={formData.shippingAddress.state}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Zip Code"
                  name="zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={handleChange}
                  required
                />

                <div className="border-2 border-ink/10 p-6 dark:border-accent/10">
                  <h2 className="font-display text-2xl font-semibold mb-4 text-ink dark:text-accent">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label key={method.value} className="flex items-center gap-3 border-2 border-ink/10 bg-surface px-4 py-3 transition hover:border-secondary/40 dark:border-accent/10 dark:bg-ink/40">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleChange}
                          className="h-4 w-4 accent-secondary"
                        />
                        <div>
                          <p className="font-medium text-ink dark:text-accent">{method.label}</p>
                          <p className="text-sm text-ink/70 dark:text-accent/70">{method.value === 'cod' ? 'Pay when your order arrives' : 'Secure online payment'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-8">
                  Place Order
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-8">
              <h2 className="font-display text-2xl font-semibold mb-5 text-ink dark:text-accent">Order Summary</h2>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const product = item.product || (typeof item.productId === 'object' ? item.productId : null);
                  const productId = normalizeProductId(product?._id || product?.id || item.productId);
                  const itemTotal = (product?.price ?? item.price ?? 0) * item.quantity;

                  return (
                    <div key={productId} className="flex items-center justify-between gap-4 border-2 border-ink/10 px-4 py-4 dark:border-accent/10">
                      <div>
                        <p className="font-medium text-ink dark:text-accent">{product?.name || 'Product'}</p>
                        <p className="text-sm text-ink/70 dark:text-accent/70">{item.quantity} × {formatPrice(product?.price ?? item.price ?? 0)}</p>
                      </div>
                      <p className="font-display font-semibold text-secondary">{formatPrice(itemTotal)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-2 border-ink/10 p-5 dark:border-accent/10">
                <div className="space-y-3 text-sm text-ink/80 dark:text-accent/80">
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
                <div className="divider my-5" />
                <div className="flex items-center justify-between text-lg font-semibold text-ink dark:text-accent">
                  <span>Total</span>
                  <span className="font-display text-secondary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

