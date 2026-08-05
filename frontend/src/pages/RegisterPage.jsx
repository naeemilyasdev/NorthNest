import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';
import { showToast } from '../utils/toast';
import { validateEmail, validateName, validatePassword } from '../utils/validators';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const validate = (data = formData) => {
    const newErrors = {};
    const firstName = (data.firstName || '').trim();
    const lastName = (data.lastName || '').trim();
    const email = (data.email || '').trim();
    const password = data.password || '';
    const confirmPassword = data.confirmPassword || '';

    if (!firstName) newErrors.firstName = 'First name is required';
    else if (!validateName(firstName)) newErrors.firstName = 'First name must be at least 2 characters';

    if (!lastName) newErrors.lastName = 'Last name is required';
    else if (!validateName(lastName)) newErrors.lastName = 'Last name must be at least 2 characters';

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (!validatePassword(password, 8)) newErrors.password = 'Password must be at least 8 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register({
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
      });
      login(response.token, response.user);
      showToast('Registration successful', 'success');
      navigate(redirect, { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton fallbackPath="/login" />
      </div>
      <div className="flex min-h-[calc(100vh-260px)] items-center justify-center">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="card border-2 border-secondary/20 bg-parchment p-8 dark:border-secondary/30 dark:bg-ink/40">
          <div className="inline-flex border-2 border-secondary/30 p-3 text-secondary"><Sparkles size={16} /></div>
          <h1 className="font-display mt-6 text-3xl font-semibold text-ink dark:text-accent">Create an account that feels as premium as the products.</h1>
          <p className="mt-4 text-base leading-8 text-ink/80 dark:text-accent/80">Join thousands of customers who enjoy a refined shopping experience with saved preferences, secure checkout, and tailored recommendations.</p>
          <div className="mt-8 border border-ink/10 p-5 text-sm text-ink/65 dark:border-accent/10 dark:text-accent/65">Immediate access to your wishlist, order history, and the latest seasonal drops.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-accent">Create account</h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-accent/75">Start your journey with us.</p>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} required />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
            <Button type="submit" loading={loading} className="w-full">Create account <ArrowRight size={14} className="ml-2" /></Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink/80 dark:text-accent/80">Already have an account? <Link to="/login" className="font-semibold text-secondary hover:text-ink dark:hover:text-accent">Sign in</Link></p>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

