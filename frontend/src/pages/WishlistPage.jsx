import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist } from '../utils/wishlist';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage = () => {
  const [items, setItems] = useState(getWishlist());

  const handleWishlistToggle = () => {
    setItems(getWishlist());
  };

  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container max-w-6xl">
        <p className="section-label mb-2">Saved</p>
        <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-4">Wishlist</h1>
        <p className="text-ink/80 dark:text-accent/80 mb-10">Your curated favorites, ready whenever you are.</p>

        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <h2 className="font-display text-2xl font-semibold mb-4 text-ink dark:text-accent">Your wishlist is empty</h2>
            <p className="text-ink/80 dark:text-accent/80 mb-6">Add products to your wishlist so you can revisit them later.</p>
            <Link to="/products" className="btn-primary">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((id) => (
              <ProductCard
                key={id}
                product={{ _id: id, name: 'Wishlist item', price: 0, description: 'Saved product', category: 'Wishlist', image: '/placeholder.png' }}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

