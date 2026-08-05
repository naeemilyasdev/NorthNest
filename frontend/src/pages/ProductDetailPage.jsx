import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Heart, MessageSquare, ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductCard } from '../components/ProductCard';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { productService } from '../services/productService';
import { isInWishlist, toggleWishlist } from '../utils/wishlist';
import { showToast } from '../utils/toast';
import { formatPrice } from '../utils/formatters';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.role === 'admin';
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const current = await productService.getProductById(id);
        const relatedResponse = await productService.getAllProducts({ limit: 3, page: 1 });

        setProduct(current.data || current);
        setRelatedProducts((relatedResponse.data || relatedResponse).filter((item) => item._id !== id).slice(0, 3));
        setWishlist(isInWishlist(id));
      } catch {
        showToast('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleWishlist = () => {
    toggleWishlist(id);
    setWishlist(!wishlist);
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item, 1);
      showToast('Added to cart', 'success');
    } catch (error) {
      showToast('Failed to add product', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please login to add a review', 'error');
      navigate(`/login?redirect=/products/${id}`);
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await productService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      const nextProduct = response.data || response;
      setProduct(nextProduct);
      setReviewComment('');
      setReviewRating(5);
      showToast('Review submitted successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return <div className="p-6 text-center text-ink/80 dark:text-accent/80">Product not found.</div>;
  }

  return (
    <div className="container py-10 space-y-12">
      <div className="mb-4">
        <BackButton fallbackPath="/products" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <img src={product.image} alt={product.name} className="w-full h-[460px] object-cover border-2 border-ink/10 dark:border-accent/10" />
            </div>
            <div className="space-y-5">
              <div className="border-2 border-ink/10 p-5 dark:border-accent/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-secondary">{product.category}</p>
                    <h1 className="font-display mt-2 text-3xl font-semibold text-ink dark:text-accent sm:text-4xl">{product.name}</h1>
                    <div className="mt-3 flex items-center gap-3 text-sm text-ink/80 dark:text-accent/80">
                      <div className="flex items-center gap-2">
                        <Star className="text-secondary" size={14} />
                        <span>{product.rating?.toFixed(1) || '0.0'} / 5</span>
                      </div>
                      <span>{product.reviews?.length || 0} reviews</span>
                    </div>
                  </div>
                  <button onClick={handleWishlist} className={`inline-flex items-center gap-2 rounded-sm border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${wishlist ? 'border-secondary bg-secondary text-white' : 'border-ink/20 text-ink hover:border-secondary hover:text-secondary dark:border-accent/20 dark:text-accent'}`}>
                    <Heart size={14} />
                    {wishlist ? 'Saved' : 'Wishlist'}
                  </button>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-ink/65 dark:text-accent/65">{product.description}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="border-2 border-ink/10 p-4 dark:border-accent/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Price</p>
                    <p className="font-display mt-2 text-2xl font-semibold text-secondary">{formatPrice(product.price)}</p>
                  </div>
                  <div className="border-2 border-ink/10 p-4 dark:border-accent/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Availability</p>
                    <p className="font-display mt-2 text-2xl font-semibold text-ink dark:text-accent">{product.stock > 0 ? 'Available' : 'Out of stock'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {!isAdmin && (
                  <button onClick={() => handleAddToCart(product)} className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
                <div className="border-2 border-ink/10 px-5 py-4 text-sm text-ink/65 dark:border-accent/10 dark:text-accent/65">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Origin</p>
                  <p>{product.origin?.region || 'Himalayan region'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="divider my-8" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border-2 border-ink/10 p-6 dark:border-accent/10">
              <h2 className="font-display text-2xl font-semibold mb-4 text-ink dark:text-accent">Product details</h2>
              <ul className="space-y-3 text-sm text-ink/65 dark:text-accent/65">
                <li><span className="font-semibold text-ink dark:text-accent">Category:</span> {product.category}</li>
                <li><span className="font-semibold text-ink dark:text-accent">Stock status:</span> {product.stock > 0 ? 'Available' : 'Out of stock'}</li>
                <li><span className="font-semibold text-ink dark:text-accent">Vendor:</span> {product.vendor?.firstName || 'North Nest'}</li>
                <li><span className="font-semibold text-ink dark:text-accent">Tags:</span> {(product.tags || ['Natural', 'Premium']).join(', ')}</li>
              </ul>
            </div>
            <div className="border-2 border-ink/10 p-6 dark:border-accent/10">
              <h2 className="font-display text-2xl font-semibold mb-4 text-ink dark:text-accent">Why customers love it</h2>
              <div className="space-y-4 text-sm text-ink/65 dark:text-accent/65">
                <p>Experience a premium Himalayan product crafted to enhance wellness, flavor, and everyday ritual.</p>
                <p>Our products are ethically sourced, carefully packaged, and delivered with attention to quality.</p>
                <p>Rated highly by customers for authenticity, taste, and durability.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-2xl font-semibold mb-4 text-ink dark:text-accent">Write a review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`border-2 p-2.5 transition ${reviewRating >= star ? 'border-secondary bg-secondary/10 text-secondary' : 'border-ink/10 text-ink/40 hover:border-secondary/40 dark:border-accent/10 dark:text-accent/40'}`}
                    >
                      <Star size={16} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">Review</label>
                <textarea
                  rows="5"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input-field w-full"
                  placeholder="Share your experience with this product"
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 text-ink dark:text-accent">
              <MessageSquare size={18} className="text-secondary" />
              <h2 className="font-display text-xl font-semibold">Customer reviews</h2>
            </div>
            <div className="mt-5 space-y-4">
              {product.reviews?.length ? (
                product.reviews.map((review) => (
                  <div key={review._id || review.id} className="border-2 border-ink/10 p-4 dark:border-accent/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink dark:text-accent">{review.userId?.firstName ? `${review.userId.firstName} ${review.userId.lastName || ''}` : 'Anonymous'}</p>
                      <div className="flex items-center gap-1 text-secondary">
                        {Array.from({ length: review.rating || 0 }).map((_, index) => (<Star key={index} size={14} />))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-ink/65 dark:text-accent/65">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink/80 dark:text-accent/80">No reviews yet. Be the first to share your experience.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div>
        <p className="section-label mb-2">You may also like</p>
        <h2 className="font-display mb-6 text-3xl font-semibold text-ink dark:text-accent">Related Products</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item._id || item.id} product={item} onAddToCart={() => handleAddToCart(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

