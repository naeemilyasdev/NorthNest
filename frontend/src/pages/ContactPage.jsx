import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { contactService } from '../services/contactService';
import { showToast } from '../utils/toast';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please complete all fields before sending.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await contactService.sendMessage(formData);
      showToast('Your message has been sent successfully.', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send your message.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] py-16">
      <div className="container max-w-5xl">
        <div className="card border-2 border-ink/10 p-10 md:p-14 dark:border-accent/15">
          <p className="section-label mb-3">Contact</p>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-4">Get in Touch</h1>
          <p className="text-ink/80 dark:text-accent/80 mb-10">Questions about our products, orders, or shipping? Our team is here to help.</p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6 border-2 border-ink/10 p-8 dark:border-accent/10">
              <h2 className="font-display text-2xl font-semibold text-ink dark:text-accent">Contact information</h2>
              <p className="text-sm text-ink/80 dark:text-accent/80">Reach out by email or use the form and our support team will respond promptly.</p>
              <div className="space-y-4 text-ink dark:text-accent">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Email</p>
                  <p className="mt-1">northnest.support@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Phone</p>
                  <p className="mt-1">+92 300 1234567</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Address</p>
                  <p className="mt-1">Gilgit Baltistan, Pakistan</p>
                </div>
              </div>
            </div>

            <form className="space-y-5 border-2 border-ink/10 p-8 dark:border-accent/10" onSubmit={handleSubmit}>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Message"
                name="message"
                as="textarea"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Send message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

