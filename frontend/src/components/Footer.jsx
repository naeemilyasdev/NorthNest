import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t-2 border-ink/10 bg-parchment text-ink dark:border-accent/10 dark:bg-ink dark:text-accent" role="contentinfo">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="font-display mb-4 text-xl font-semibold text-accent">North Nest</h3>
            <p className="max-w-xs text-sm leading-7 text-ink/85 dark:text-accent/80">
              Authentic mountain goods — handpicked from Himalayan growers and artisans, delivered with care.
            </p>
          </div>
          <div>
            <nav aria-label="Explore links">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Explore</h4>
              <ul className="space-y-2.5 text-sm text-ink/85 dark:text-accent/80">
                <li><Link to="/" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Home</Link></li>
                <li><Link to="/products" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Products</Link></li>
                <li><Link to="/about" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">About Us</Link></li>
                <li><Link to="/contact" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Contact</Link></li>
              </ul>
            </nav>
          </div>
          <div>
            <nav aria-label="Collections">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Collections</h4>
              <ul className="space-y-2.5 text-sm text-ink/85 dark:text-accent/80">
                <li><Link to="/products" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Honey</Link></li>
                <li><Link to="/products" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Dry Fruits</Link></li>
                <li><Link to="/products" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Herbs & Spices</Link></li>
                <li><Link to="/products" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Tea</Link></li>
              </ul>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Get in touch</h4>
            <address className="not-italic space-y-3 text-sm text-ink/85 dark:text-accent/80">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-secondary" /><p>Gilgit Baltistan, Pakistan</p></div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-secondary" /><a href="tel:+923001234567" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">+92 300 1234567</a></div>
              <div className="flex items-center gap-2"><Mail size={14} className="text-secondary" /><a href="mailto:northnest.support@gmail.com" className="transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">northnest.support@gmail.com</a></div>
            </address>
          </div>
        </div>
        <hr className="my-8 border-accent/10" aria-hidden="true" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs uppercase tracking-wider text-ink/70 dark:text-accent/50">© 2026 North Nest. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-sm border border-accent/20 p-2 text-ink/70 transition hover:border-secondary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"><Facebook size={14} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="rounded-sm border border-accent/20 p-2 text-ink/70 transition hover:border-secondary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"><Twitter size={14} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-sm border border-accent/20 p-2 text-ink/70 transition hover:border-secondary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"><Instagram size={14} /></a>
            <Link to="/contact" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/80 transition hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary">Book a call <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

