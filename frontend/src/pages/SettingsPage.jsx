import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { showToast } from '../utils/toast';
import { formatDate } from '../utils/formatters';

const DEFAULT_TEAM = [
  {
    name: 'Ayesha',
    position: 'Founder',
    intro: 'Founder & sourcing lead, connecting mountain growers with customers worldwide.',
    profilePic: '',
  },
  {
    name: 'Mohammed',
    position: 'Operations Manager',
    intro: 'Operations manager ensuring every product is handled with care and shipped promptly.',
    profilePic: '',
  },
  {
    name: 'Sara',
    position: 'Customer Experience Lead',
    intro: 'Customer experience lead, available to support you before, during, and after every order.',
    profilePic: '',
  },
];

export const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState({
    storeName: 'North Nest',
    tagline: 'Mountain essentials from the Himalayas',
    logo: '',
    team: DEFAULT_TEAM,
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = isAdmin
          ? await settingsService.getAdminStoreSettings()
          : await settingsService.getStoreSettings();

        setSettings((prev) => ({
          ...prev,
          storeName: data.storeName || prev.storeName,
          tagline: data.tagline || prev.tagline,
          logo: data.logo || '',
          team: Array.isArray(data.team) ? data.team : prev.team,
          totalOrders: data.totalOrders || prev.totalOrders,
          deliveredOrders: data.deliveredOrders || prev.deliveredOrders,
          cancelledOrders: data.cancelledOrders || prev.cancelledOrders,
        }));
        setImagePreview(data.logo || '');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load settings', 'error');
      }
    };

    loadSettings();
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const logo = reader.result;
      setImagePreview(logo);
      setSettings((prev) => ({ ...prev, logo }));
    };
    reader.readAsDataURL(file);
  };

  const handleTeamChange = (index, field, value) => {
    setSettings((prev) => {
      const updatedTeam = [...prev.team];
      updatedTeam[index] = {
        ...updatedTeam[index],
        [field]: value,
      };
      return { ...prev, team: updatedTeam };
    });
  };

  const handleTeamImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const profilePic = reader.result;
      setSettings((prev) => {
        const updatedTeam = [...prev.team];
        updatedTeam[index] = {
          ...updatedTeam[index],
          profilePic,
        };
        return { ...prev, team: updatedTeam };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddTeamMember = () => {
    setSettings((prev) => ({
      ...prev,
      team: [
        ...prev.team,
        { name: '', position: '', intro: '', profilePic: '' },
      ],
    }));
  };

  const handleRemoveTeamMember = (index) => {
    setSettings((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only admins may update store branding.', 'error');
      return;
    }

    try {
      setSaving(true);
      const updated = await settingsService.updateAdminStoreSettings({
        storeName: settings.storeName,
        tagline: settings.tagline,
        logo: settings.logo,
        team: settings.team,
      });
      setSettings((prev) => ({
        ...prev,
        storeName: updated.storeName,
        tagline: updated.tagline,
        logo: updated.logo,
        team: Array.isArray(updated.team) ? updated.team : prev.team,
      }));
      setImagePreview(updated.logo || '');
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: updated }));
      showToast('Store branding updated successfully.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save store settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] py-12">
      <div className="container max-w-6xl">
        <div className="card p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="section-label mb-2">Settings</p>
              <h1 className="font-display text-4xl font-semibold text-ink dark:text-accent mb-2">Store & Account Settings</h1>
              <p className="text-ink/80 dark:text-accent/80">Admins can update store branding, logo, and view order history counts.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.firstName || user?.name || 'User'}</p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{isAdmin ? 'Admin' : 'Customer'}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
            <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
              <div>
                <h2 className="text-xl font-semibold text-ink dark:text-accent">Account Overview</h2>
                <p className="mt-2 text-sm text-ink/80 dark:text-accent/80">Your profile and account details.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First Name" name="firstName" value={user?.firstName || ''} readOnly />
                <Input label="Last Name" name="lastName" value={user?.lastName || ''} readOnly />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Email" name="email" value={user?.email || ''} readOnly />
                <Input label="Role" name="role" value={user?.role || ''} readOnly />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
              <h2 className="text-xl font-semibold text-ink dark:text-accent">Store Branding</h2>
              <p className="mt-2 text-sm text-ink/80 dark:text-accent/80">Logo, store name, and tagline are managed here for the storefront.</p>
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <Input label="Store name" name="storeName" value={settings.storeName} onChange={handleChange} required={isAdmin} />
                <Input label="Tagline" name="tagline" value={settings.tagline} onChange={handleChange} required={isAdmin} />
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink dark:text-accent">Store logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isAdmin}
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-accent"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Logo preview" className="mt-3 h-32 w-full rounded-3xl object-contain border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950" />
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-ink dark:text-accent">Team members</h3>
                      <p className="mt-1 text-sm text-ink/70 dark:text-accent/70">Manage team member data, positions, intros, and profile images.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="rounded-full border border-secondary/30 bg-secondary/5 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
                    >
                      Add member
                    </button>
                  </div>

                  <div className="space-y-6">
                    {settings.team.map((member, index) => (
                      <div key={`${member.name}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="grid flex-1 gap-4 sm:grid-cols-2">
                            <Input
                              label="Name"
                              name={`teamName-${index}`}
                              value={member.name}
                              onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                              disabled={!isAdmin}
                            />
                            <Input
                              label="Position"
                              name={`teamPosition-${index}`}
                              value={member.position}
                              onChange={(e) => handleTeamChange(index, 'position', e.target.value)}
                              disabled={!isAdmin}
                            />
                            <Input
                              label="Intro"
                              as="textarea"
                              name={`teamIntro-${index}`}
                              value={member.intro}
                              onChange={(e) => handleTeamChange(index, 'intro', e.target.value)}
                              disabled={!isAdmin}
                              className="sm:col-span-2"
                            />
                          </div>
                          <div className="flex w-full max-w-[200px] flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white dark:bg-slate-950">
                              {member.profilePic ? (
                                <img src={member.profilePic} alt={member.name || 'Team member'} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-3xl font-bold text-ink/70 dark:text-accent/70">{(member.name || 'T').charAt(0)}</span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={!isAdmin}
                              onChange={(e) => handleTeamImageUpload(index, e.target.files?.[0])}
                              className="w-full text-sm text-ink dark:text-accent"
                            />
                            {settings.team.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(index)}
                                className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {isAdmin ? (
                  <Button type="submit" loading={saving} className="w-full">Save store settings</Button>
                ) : (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Only admins may update store logo and branding.</div>
                )}
              </form>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-ink dark:text-accent">Admin history</h2>
                  <p className="mt-2 text-sm text-ink/80 dark:text-accent/80">Summary of order performance for the storefront.</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Updated {formatDate(new Date())}</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total orders</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{settings.totalOrders || 0}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Delivered</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">{settings.deliveredOrders || 0}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Rejected / Cancelled</p>
                  <p className="mt-3 text-3xl font-semibold text-red-600 dark:text-red-300">{settings.cancelledOrders || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

