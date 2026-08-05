import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { showToast } from '../utils/toast';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productService.getAllProducts({ limit: 6 });
      setProducts(response.data || []);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast('Failed to add product', 'error');
    }
  };

  const features = [
    { icon: Leaf, title: 'Organic & traceable', description: 'Every ingredient is hand-selected from trusted Himalayan growers.' },
    { icon: ShieldCheck, title: 'Premium quality', description: 'Elevated craftsmanship, rigorous standards, and elegant presentation.' },
    { icon: Truck, title: 'Fast delivery', description: 'Thoughtful shipping and reliable fulfillment across every order.' },
  ];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(12,10,8,0.45), rgba(12,10,8,0.25)), url('https://images.unsplash.com/photo-1508264165352-c6a85a4b5f3b?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d7f6b2d7f6d5f6a')`,
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
          }}
        />
        <div className="relative py-28 sm:py-36">
          <div className="container grid items-center gap-16 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-parchment/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                <Sparkles size={14} />
                New season essentials
              </div>
              <h1 className="font-display hero-title text-white">Wellness, beauty, and heritage from the roof of the world.</h1>
              <p className="mt-6 hero-subtitle text-parchment/90">Experience a refined commerce journey built around premium Himalayan products, thoughtful service, and a design that feels as elevated as your lifestyle.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary btn-lg">Shop the collection</Link>
                <Link to="/about" className="btn-outline btn-lg border-parchment/30 text-parchment/90 hover:bg-parchment hover:text-ink">Discover our story</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="z-10">
              <div className="rounded-xl border-2 border-parchment/20 bg-parchment/6 p-6 backdrop-blur-sm max-w-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-parchment/80">Curated capsule</p>
                <p className="font-display mt-3 text-2xl font-semibold text-white">A premium mountain experience</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {['Handcrafted quality', 'Natural wellness', 'Limited seasonal drops', 'Fast concierge support'].map((item) => (
                    <div key={item} className="border border-parchment/10 px-4 py-3 text-sm text-parchment/85">{item}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="mb-12 flex flex-col gap-3">
            <p className="section-label">Why it feels different</p>
            <h2 className="font-display text-3xl font-semibold text-ink dark:text-accent sm:text-4xl">Designed to feel like a modern luxury brand.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} viewport={{ once: true }} className="card group">
                <div className="mb-5 flex h-11 w-11 items-center justify-center border-2 border-secondary/30 text-secondary transition group-hover:bg-secondary group-hover:text-white">
                  <feature.icon size={20} />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink dark:text-accent">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/80 dark:text-accent/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">Featured collection</p>
              <h2 className="font-display text-3xl font-semibold text-ink dark:text-accent sm:text-4xl">New arrivals with elevated detail.</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-ink dark:hover:text-accent">Browse full catalog <ArrowRight size={14} /></Link>
          </div>
          {loading ? <Loading /> : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <motion.div key={product._id} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} viewport={{ once: true }}>
                  <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link to="/products" className="btn-secondary">View all products</Link>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative border-2 border-ink/10 bg-parchment p-10 text-center dark:border-accent/15 dark:bg-ink/40 sm:p-14">
            <div className="absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-secondary" />
            <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-secondary" />
            <p className="section-label">Ready to explore</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-ink dark:text-accent sm:text-4xl">Start your transformative wellness journey today.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ink/80 dark:text-accent/80">Design-rich shopping, thoughtful support, and premium products that feel special from the first click.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="btn-primary">Explore the collection</Link>
              <Link to="/contact" className="btn-outline">Talk to us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

