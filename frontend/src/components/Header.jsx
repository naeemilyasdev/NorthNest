import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Sun, MoonStar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../context/ThemeContext';
import { settingsService } from '../services/settingsService';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const isAdmin = user?.role === 'admin';
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ storeName: 'North Nest', logo: '' });

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const cartItemCount = Number(cart?.itemCount || 0);
  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-semibold tracking-wide transition ${
      isActive ? 'text-secondary' : 'text-ink/85 hover:text-secondary'
    }`;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getStoreSettings();
        setStoreSettings({
          storeName: data.storeName || 'North Nest',
          logo: data.logo || '',
        });
      } catch (error) {
        console.error('Header settings load failed', error);
      }
    };

    const handleSettingsUpdate = (event) => {
      const data = event.detail;
      if (data) {
        setStoreSettings({
          storeName: data.storeName || 'North Nest',
          logo: data.logo || '',
        });
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    loadSettings();

    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-parchment/98 border-b border-transparent backdrop-blur-sm dark:bg-ink/95">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-sm shadow-slate-200 dark:bg-slate-900 dark:shadow-slate-800/50">
            {storeSettings.logo ? (
              <img src={storeSettings.logo} alt={storeSettings.storeName} className="h-full w-full rounded-xl object-contain" />
            ) : (
              <span className="font-display text-2xl font-extrabold">NN</span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-lg font-semibold text-ink dark:text-accent">{storeSettings.storeName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/70 dark:text-accent/60">{storeSettings.tagline || 'Mountain essentials'}</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="rounded-md p-2 text-ink/85 dark:text-accent/80" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <MoonStar size={18} />}
          </button>

          {!isAdmin && (
            <Link to="/cart" className="relative rounded-md p-2 text-ink/85 dark:text-accent/80">
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">{cartItemCount}</span>
              )}
            </Link>
          )}

          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm text-ink/85 hover:text-secondary">Login</Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-surface dark:bg-ink">
                <User size={16} />
                <span className="hidden sm:inline text-ink/85 dark:text-accent/80">{user?.firstName || user?.name}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-surface p-2 shadow-md dark:bg-ink">
                  <Link to="/profile" className="block px-3 py-2 text-sm text-ink/80">Profile</Link>
                  <Link to="/orders" className="block px-3 py-2 text-sm text-ink/80">Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-ink/80">Logout</button>
                </div>
              )}
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-surface p-3 dark:bg-ink">
          <nav className="flex flex-col gap-2">
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="px-3 py-2">Products</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="px-3 py-2">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="px-3 py-2">Contact</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-3 py-2">Login</Link>
                <Link to="/register" className="px-3 py-2 btn-primary text-center">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="px-3 py-2">Profile</Link>
                <button onClick={handleLogout} className="px-3 py-2 text-left">Logout</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
                              <User size={16} />
