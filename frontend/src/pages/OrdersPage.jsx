import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Loading } from '../components/Loading';
import { formatPrice, formatDate } from '../utils/formatters';
import { showToast } from '../utils/toast';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container">
        <p className="section-label mb-2">History</p>
        <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink/80 dark:text-accent/80 mb-4">You haven't placed any orders yet</p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card border-2 border-ink/10 p-6 dark:border-accent/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Order Number</p>
                    <p className="font-semibold text-ink dark:text-accent">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Order Date</p>
                    <p className="font-semibold text-ink dark:text-accent">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Total</p>
                    <p className="font-display font-semibold text-secondary">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Status</p>
                    <p className={`font-semibold uppercase text-xs tracking-wider ${
                      order.orderStatus === 'delivered' ? 'text-success' :
                      order.orderStatus === 'cancelled' ? 'text-error' :
                      'text-secondary'
                    }`}>
                      {order.orderStatus}
                    </p>
                  </div>
                </div>

                <div className="divider my-4" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70 mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item, index) => {
                      const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                      const productName = product?.name || (typeof item.productId === 'string' ? item.productId : 'Unknown product');

                      return (
                        <li key={item._id || index} className="text-sm text-ink/65 dark:text-accent/65">
                          {productName} x {item.quantity}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-secondary hover:text-ink dark:hover:text-accent"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

