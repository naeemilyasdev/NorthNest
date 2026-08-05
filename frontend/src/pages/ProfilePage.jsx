import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { showToast } from '../utils/toast';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || {},
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container max-w-2xl">
        <p className="section-label mb-2">Account</p>
        <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-8">My Profile</h1>

        <form onSubmit={handleSubmit} className="card p-8">
          <h2 className="font-display text-2xl font-semibold mb-6 text-ink dark:text-accent">Personal Information</h2>

          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <h2 className="font-display text-2xl font-semibold mb-6 mt-8 text-ink dark:text-accent">Address</h2>

          <Input
            label="Street"
            name="street"
            value={formData.address.street || ''}
            onChange={handleAddressChange}
          />

          <Input
            label="City"
            name="city"
            value={formData.address.city || ''}
            onChange={handleAddressChange}
          />

          <Input
            label="State"
            name="state"
            value={formData.address.state || ''}
            onChange={handleAddressChange}
          />

          <Input
            label="Country"
            name="country"
            value={formData.address.country || ''}
            onChange={handleAddressChange}
          />

          <Input
            label="Zip Code"
            name="zipCode"
            value={formData.address.zipCode || ''}
            onChange={handleAddressChange}
          />

          <Button type="submit" loading={loading} className="w-full">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
