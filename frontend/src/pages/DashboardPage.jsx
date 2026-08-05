import React from 'react';

export const DashboardPage = () => {
  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container max-w-6xl">
        <div className="card p-8">
          <p className="section-label mb-2">Overview</p>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-4">Dashboard</h1>
          <p className="text-ink/80 dark:text-accent/80 mb-8">Welcome back! Here you can manage orders, track your purchases, and view your account activity.</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card border-2 border-ink/10 p-6 transition hover:border-secondary/40 dark:border-accent/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-2">Orders</p>
              <h2 className="font-display text-3xl font-bold text-ink dark:text-accent">12</h2>
              <p className="text-sm text-ink/70 dark:text-accent/70 mt-3">Completed orders this month.</p>
            </div>
            <div className="card border-2 border-ink/10 p-6 transition hover:border-secondary/40 dark:border-accent/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-2">Wishlist</p>
              <h2 className="font-display text-3xl font-bold text-ink dark:text-accent">8</h2>
              <p className="text-sm text-ink/70 dark:text-accent/70 mt-3">Items saved for later.</p>
            </div>
            <div className="card border-2 border-ink/10 p-6 transition hover:border-secondary/40 dark:border-accent/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-2">Spending</p>
              <h2 className="font-display text-3xl font-bold text-ink dark:text-accent">$1,580</h2>
              <p className="text-sm text-ink/70 dark:text-accent/70 mt-3">Total spend this year.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

