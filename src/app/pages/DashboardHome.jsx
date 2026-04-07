import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { Shield, UserRound, Users, Megaphone, Sparkles, Phone, Mail, CircleCheckBig, ChevronRight, Search, SearchX, CheckCircle2, XCircle, Copy, Clock3, LockKeyhole, LayoutGrid, UserPen } from 'lucide-react';

import { DashboardLayout } from '../components/dashboards/DashboardLayout';
import { SectionHeader } from '../components/common/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';

export function DashboardHome() {
  const { user, updateProfile, logout } = useAuth();
  const { lang } = useLanguage();
  const { trackEvent } = useDashboardAnalytics();
  const [panelQuery, setPanelQuery] = useState(() => localStorage.getItem('cc_dashboard_panel_query') || '');
  const [toast, setToast] = useState(null);
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('cc_dashboard_compact') === '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cc_dashboard_contrast') === '1');
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '');
  const [profileError, setProfileError] = useState('');

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  const roleLabel = user.role === 'admin'
    ? 'Administrator'
    : user.role === 'moderator'
      ? 'Moderator'
      : user.role === 'politician'
        ? 'Politician'
        : 'Citizen';

  const quickLinks = [
    {
      key: 'citizen',
      to: '/citizen',
      label: 'Citizen Panel',
      hint: 'Report civic issues and track complaint progress',
      icon: UserRound,
      visible: user.role === 'citizen' || user.role === 'admin',
    },
    {
      key: 'mod',
      to: '/mod',
      label: 'Moderator Panel',
      hint: 'Review and resolve queue items quickly',
      icon: Users,
      visible: user.role === 'moderator' || user.role === 'admin',
    },
    {
      key: 'politician',
      to: '/poicitfrn',
      label: 'Politician Panel',
      hint: 'Publish updates and respond to public feedback',
      icon: Megaphone,
      visible: user.role === 'politician' || user.role === 'admin',
    },
    {
      key: 'admin',
      to: '/admin',
      label: 'Admin Panel',
      hint: 'Manage users, roles, and platform controls',
      icon: Shield,
      visible: user.role === 'admin',
    },
  ].filter((item) => item.visible);

  const filteredLinks = useMemo(() => {
    const query = panelQuery.trim().toLowerCase();
    if (!query) return quickLinks;
    return quickLinks.filter((item) =>
      item.label.toLowerCase().includes(query) ||
      item.hint.toLowerCase().includes(query) ||
      item.to.toLowerCase().includes(query),
    );
  }, [panelQuery, quickLinks]);

  const stats = [
    { label: 'Panels Available', value: String(quickLinks.length) },
    { label: 'Current Role', value: roleLabel },
    { label: 'Onboarding', value: user.onboardingCompleted ? 'Complete' : 'Pending' },
    { label: 'Account Status', value: user.status || 'active' },
  ];

  const profileSignals = [
    Boolean(user.name && user.name.trim().length >= 3),
    Boolean(user.email && user.email.includes('@')),
    Boolean(user.phoneNumber && user.phoneNumber.trim().length >= 7),
    Boolean(user.onboardingCompleted),
  ];
  const profileCompletionPercent = Math.round((profileSignals.filter(Boolean).length / profileSignals.length) * 100);
  const contactVerified = Boolean(user.email && user.email.includes('@') && user.phoneNumber && user.phoneNumber.trim().length >= 7);

  const roleQuickEntry = user.role === 'admin'
    ? { to: '/admin?quick=users', label: 'Open User Management' }
    : user.role === 'moderator'
      ? { to: '/moderator?quick=queue', label: 'Open Moderation Queue' }
      : user.role === 'politician'
        ? { to: '/politician?quick=announcement', label: 'Create Announcement' }
        : { to: '/citizen?quick=complaint', label: 'Quick Complaint Entry' };

  const lastLoginDisplay = user.lastLoginAt
    ? new Intl.DateTimeFormat(
      { EN: 'en-IN', HI: 'hi-IN', TE: 'te-IN', TA: 'ta-IN' }[lang] || 'en-IN',
      { dateStyle: 'medium', timeStyle: 'short' },
    ).format(new Date(user.lastLoginAt))
    : 'First session';

  const buttonBase = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition';

  const roleLegend = [
    { key: 'citizen', label: 'Citizen', className: 'bg-orange-100 text-[#cc6f1c] border-orange-200' },
    { key: 'moderator', label: 'Moderator', className: 'bg-blue-100 text-[#1e3a8a] border-blue-200' },
    { key: 'politician', label: 'Politician', className: 'bg-green-100 text-[#166534] border-green-200' },
    { key: 'admin', label: 'Admin', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('cc_dashboard_panel_query', panelQuery);
  }, [panelQuery]);

  useEffect(() => {
    localStorage.setItem('cc_dashboard_compact', compactMode ? '1' : '0');
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('cc_dashboard_contrast', highContrast ? '1' : '0');
  }, [highContrast]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      trackEvent('copy_email', { role: user.role });
      showToast('success', 'Email copied to clipboard');
    } catch {
      showToast('error', 'Unable to copy email');
    }
  };

  const resetSearch = () => {
    trackEvent('reset_panel_search', { role: user.role });
    setPanelQuery('');
    showToast('success', 'Panel search reset');
  };

  const toggleCompactMode = () => {
    setCompactMode((prev) => {
      const next = !prev;
      showToast('success', next ? 'Compact mode enabled' : 'Compact mode disabled');
      return next;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      showToast('success', next ? 'High contrast enabled' : 'High contrast disabled');
      return next;
    });
  };

  const openProfileModal = () => {
    trackEvent('open_profile_modal', { role: user.role });
    setProfileName(user?.name || '');
    setProfilePhone(user?.phoneNumber || '');
    setProfileError('');
    setShowProfileModal(true);
  };

  const saveProfile = () => {
    const trimmedName = profileName.trim();
    const trimmedPhone = profilePhone.trim();

    if (trimmedName.length < 3) {
      setProfileError('Full name should be at least 3 characters.');
      return;
    }

    if (trimmedPhone && !/^[0-9+() -]{7,20}$/.test(trimmedPhone)) {
      setProfileError('Phone number format is invalid. Use 7-20 digits/chars.');
      return;
    }

    updateProfile({ name: trimmedName, phoneNumber: trimmedPhone });
    trackEvent('save_profile', { role: user.role });
    setShowProfileModal(false);
    showToast('success', 'Profile updated successfully');
  };

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className={`${highContrast ? 'contrast-125 saturate-50' : ''} ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>

            {profileError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {profileError}
              </div>
            )}

            <div className="space-y-3">
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933]"
              />
              <input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowProfileModal(false)} className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}>
                Cancel
              </button>
              <button type="button" onClick={saveProfile} className={`${buttonBase} bg-[#FF9933] text-white hover:bg-[#e8871e]`}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`min-w-[220px] max-w-sm rounded-xl border px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        </div>
      )}

      {isOffline && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm font-medium">
          You are offline. Some dashboard actions may fail until your connection is restored.
        </div>
      )}

      <section aria-labelledby="dashboard-welcome-heading" className="mb-6 md:mb-8 rounded-3xl border border-orange-100 bg-[radial-gradient(circle_at_0%_0%,#fff7ed_0%,#ffffff_42%,#f8fafc_100%)] p-4 sm:p-5 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#cc6f1c] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Unified Dashboard Hub
            </div>
            <h1 id="dashboard-welcome-heading" className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Start from one place, then jump to the right workspace for your responsibilities.
            </p>
          </div>

          <div className="cc-card p-4 w-full lg:w-auto lg:min-w-[280px]">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Profile Snapshot</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-700"><CircleCheckBig className="w-4 h-4 text-green-600" /> {roleLabel}</div>
              <div className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-gray-400" /> {user.email}</div>
              <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" /> {user.phoneNumber || 'Not added'}</div>
              <div className="flex items-center gap-2 text-gray-700"><Clock3 className="w-4 h-4 text-gray-400" /> {lastLoginDisplay}</div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                  <span className="font-semibold">Profile completeness</span>
                  <span>{profileCompletionPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#FF9933] transition-all" style={{ width: `${profileCompletionPercent}%` }} />
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${contactVerified ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  {contactVerified ? 'Contact Verified' : 'Contact Unverified'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={copyEmail}
              className={`mt-4 ${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Email
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Dashboard quick actions" className="sticky top-20 z-20 mb-6 rounded-2xl border border-gray-100 bg-white/90 backdrop-blur px-3 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Quick Actions</span>
          <Link to="/dashboard" className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Refresh Hub
          </Link>
          {quickLinks[0] && (
            <Link
              to={quickLinks[0].to}
              onClick={() => trackEvent('open_primary_panel', { panel: quickLinks[0].key, role: user.role })}
              className={`${buttonBase} bg-[#FF9933] text-white hover:bg-[#e8871e]`}
            >
              Open Primary Panel
            </Link>
          )}
          <Link
            to={roleQuickEntry.to}
            onClick={() => trackEvent('quick_entry', { role: user.role, target: roleQuickEntry.to })}
            className={`${buttonBase} bg-[#138808] text-white hover:bg-[#0f6506]`}
          >
            {roleQuickEntry.label}
          </Link>
          <button
            type="button"
            onClick={copyEmail}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            <Copy className="w-3.5 h-3.5" /> Copy Email
          </button>
          <button
            type="button"
            onClick={openProfileModal}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            <UserPen className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            type="button"
            onClick={toggleCompactMode}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            {compactMode ? 'Normal Spacing' : 'Compact Mode'}
          </button>
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            {highContrast ? 'Normal Contrast' : 'High Contrast'}
          </button>
        </div>
      </section>

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900 flex items-start gap-2">
        <LockKeyhole className="w-4 h-4 mt-0.5" />
        Use Google sign-in only on trusted devices. Avoid sharing OTPs or session cookies.
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-gray-500 mr-1 mt-1">Role Legend</span>
        {roleLegend.map((item) => (
          <span key={item.key} className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${item.className}`}>
            {item.label}
          </span>
        ))}
      </div>

      <section aria-label="Dashboard summary stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((item) => (
          <div key={item.label} className="cc-card p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
            <p className="mt-2 text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-gray-500 mt-1">Shortcuts</span>
        {quickLinks.map((item) => (
          <Link
            key={`shortcut-${item.key}`}
            to={item.to}
            onClick={() => trackEvent('shortcut_open', { panel: item.key, role: user.role })}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <SectionHeader
        title="Your Panels"
        subtitle="Choose where you want to work"
        actions={(
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={panelQuery}
                onChange={(e) => setPanelQuery(e.target.value)}
                placeholder="Search panel by name or route"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933]"
              />
            </div>
            {panelQuery && (
              <button
                type="button"
                onClick={resetSearch}
                className={`${buttonBase} border border-gray-200 bg-white text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
              >
                Reset
              </button>
            )}
          </div>
        )}
      />

      <section aria-label="Available role panels" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.to}
              onClick={() => trackEvent('panel_open', { panel: item.key, role: user.role, queryActive: Boolean(panelQuery.trim()) })}
              className="group cc-card cc-hover-lift p-5 md:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9933]"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF9933] flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{item.label}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.hint}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF9933]">
                Open Panel <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}

        {filteredLinks.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No panel found</p>
            <p className="text-sm text-gray-500 mt-1">No panel matches "{panelQuery}". Try a different keyword.</p>
          </div>
        )}
      </section>
      </div>
    </DashboardLayout>
  );
}
