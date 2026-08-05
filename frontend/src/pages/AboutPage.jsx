import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Leaf, Globe } from 'lucide-react';
import { settingsService } from '../services/settingsService';

const aboutFeatures = [
  {
    icon: Sparkles,
    title: 'Premium Himalayan Goods',
    description: 'Select products sourced from mountain farms, artisans, and trusted cooperatives.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Purity Assured',
    description: 'Every product is inspected for authenticity, freshness, and purity.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    description: 'Ethical sourcing and eco-friendly packaging shape every order.',
  },
  {
    icon: Globe,
    title: 'Community Support',
    description: 'We partner with local growers to uplift Himalayan communities.',
  },
];

export const AboutPage = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'North Nest',
    logo: '',
    tagline: 'Mountain essentials',
    team: [],
  });

  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        const data = await settingsService.getStoreSettings();
        setStoreSettings({
          storeName: data.storeName || 'North Nest',
          logo: data.logo || '',
          tagline: data.tagline || 'Mountain essentials',
          team: Array.isArray(data.team) ? data.team : [],
        });
      } catch (error) {
        console.error('Failed to load store settings for About page', error);
      }
    };

    loadStoreSettings();
  }, []);

  return (
    <div className="min-h-[calc(100vh-300px)] py-16">
      <div className="container max-w-6xl space-y-14">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8 rounded-3xl border border-ink/10 bg-white/90 p-10 shadow-sm shadow-slate-200/40 dark:border-accent/15 dark:bg-slate-950/90 dark:shadow-slate-950/20">
            <p className="section-label">About {storeSettings.storeName}</p>
            <h1 className="font-display text-5xl font-semibold leading-tight text-ink dark:text-accent sm:text-6xl">We are the people behind premium Himalayan living.</h1>
            <p className="max-w-2xl text-lg leading-9 text-ink/80 dark:text-accent/80">{storeSettings.storeName} is more than a store. We are a team of mountain-loving founders, sourcing experts, and customer care specialists who bring authentic Himalayan products to your home with transparency, trust, and warm service.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                Explore our collection
              </Link>
              <a href="#team" className="btn-outline">
                Meet our team
              </a>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-slate-50 p-6 shadow-sm shadow-slate-200/30 dark:border-accent/15 dark:bg-slate-900/80 dark:shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm shadow-slate-200/20 dark:bg-slate-950/80 dark:shadow-slate-950/10">
                  {storeSettings.logo ? (
                    <img src={storeSettings.logo} alt={`${storeSettings.storeName} logo`} className="h-20 w-20 rounded-3xl object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-secondary">NN</span>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-ink/50 dark:text-accent/50">Brand mark</p>
                  <h2 className="font-display text-2xl font-semibold text-ink dark:text-accent">{storeSettings.storeName}</h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-ink/70 dark:text-accent/70">{storeSettings.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {aboutFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-4 rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-sm shadow-slate-200/20 dark:border-accent/15 dark:bg-slate-950/95 dark:shadow-slate-950/10">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-secondary/30 bg-secondary/5 text-secondary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink dark:text-accent">{feature.title}</h3>
                    <p className="mt-2 text-sm text-ink/70 dark:text-accent/70">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="team" className="space-y-8">
          <div className="text-center">
            <p className="section-label">Our team</p>
            <h2 className="font-display text-4xl font-semibold text-ink dark:text-accent">The faces bringing North Nest to life.</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-ink/80 dark:text-accent/80">Every order is backed by people who care about quality, authenticity, and your experience. Meet the trusted team who source products, manage operations, and deliver support.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {storeSettings.team.length > 0 ? (
              storeSettings.team.map((member, index) => (
                <div key={`${member.name}-${index}`} className="card p-8 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary/10 text-secondary">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name || 'Team member'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold">{(member.name || 'T').charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-ink dark:text-accent">{member.name || 'Team member'}</h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.25em] text-ink/50 dark:text-accent/50">{member.position || 'Team'}</p>
                  <p className="mt-4 text-sm text-ink/70 dark:text-accent/70">{member.intro || 'A passionate member of our team.'}</p>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 rounded-3xl border border-ink/10 bg-slate-50 p-8 text-center text-sm text-ink/80 dark:border-accent/15 dark:bg-slate-900/80 dark:text-accent/80">
                Team information will appear here once an admin adds it in settings.
              </div>
            )}
          </div>
        </section>

        <section id="story" className="grid gap-8 lg:grid-cols-2">
          <div className="card p-10">
            <p className="section-label">Our story</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-ink dark:text-accent">From Himalayan peaks to your doorstep.</h2>
            <p className="mt-6 text-base leading-8 text-ink/80 dark:text-accent/80">North Nest began with a simple promise: authentic, responsibly sourced products that celebrate mountain heritage. We work directly with growers and artisans, supporting communities while delivering exceptional natural goods.</p>
            <p className="mt-6 text-base leading-8 text-ink/80 dark:text-accent/80">Every product is selected for quality, thoughtfully packaged, and backed by customer care so you can enjoy a premium shopping experience.</p>
          </div>

          <div className="grid gap-4">
            <div className="card p-10">
              <p className="section-label">Sustainability</p>
              <h3 className="font-display mt-4 text-2xl font-semibold text-ink dark:text-accent">Practices that protect nature and people.</h3>
              <p className="mt-4 text-sm text-ink/80 dark:text-accent/80">From reusable packaging to fair trade sourcing, we prioritize a clean supply chain and meaningful impact.</p>
            </div>
            <div className="card p-10">
              <p className="section-label">Care & quality</p>
              <h3 className="font-display mt-4 text-2xl font-semibold text-ink dark:text-accent">Premium support at every step.</h3>
              <p className="mt-4 text-sm text-ink/80 dark:text-accent/80">Our customer experience team ensures your order is handled with care from purchase to delivery.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

