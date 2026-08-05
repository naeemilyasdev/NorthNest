import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';
import { showToast } from '../utils/toast';
import { validateEmail, validatePassword } from '../utils/validators';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const validate = (data = formData) => {
    const newErrors = {};
    const email = (data.email || '').trim();
    const password = data.password || '';

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (!validatePassword(password, 8)) newErrors.password = 'Password must be at least 8 characters';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    setErrors(validate(updatedData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      login(response.token, response.user);
      showToast('Login successful', 'success');

      const isAdmin = response.user?.role === 'admin';
      const destination = isAdmin ? '/admin' : redirect;

      navigate(destination, { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton fallbackPath="/" />
      </div>
      <div className="flex min-h-[calc(100vh-260px)] items-center justify-center">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="card border-2 border-ink/10 bg-parchment p-8 dark:border-accent/15 dark:bg-ink/40">
          <p className="section-label">Welcome back</p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-ink dark:text-accent">Sign in to North Nest</h1>
          <p className="mt-4 text-base leading-8 text-ink/80 dark:text-accent/80">Access your dashboard, orders, and curated home essentials from one secure workspace.</p>
          <div className="mt-8 space-y-2">
            {['Secure checkout', 'Saved favorites', 'Fast order tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-ink/10 px-4 py-3 text-sm text-ink/65 dark:border-accent/10 dark:text-accent/65">
                <ShieldCheck size={14} className="text-secondary" />{item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-accent">Login</h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-accent/75">Enter your details to continue.</p>
          <form onSubmit={handleSubmit} className="mt-8">
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} required />
            <Button type="submit" loading={loading} className="w-full">Continue <ArrowRight size={14} className="ml-2" /></Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink/80 dark:text-accent/80">Don't have an account? <Link to="/register" className="font-semibold text-secondary hover:text-ink dark:hover:text-accent">Create one</Link></p>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

