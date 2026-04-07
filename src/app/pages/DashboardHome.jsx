import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { Shield, UserRound, Users, Megaphone, Sparkles, Phone, Mail, CircleCheckBig, ChevronRight, Search, SearchX, CheckCircle2, XCircle, Copy, Clock3, LockKeyhole, LayoutGrid } from 'lucide-react';

import { DashboardLayout } from '../components/dashboards/DashboardLayout';
import { SectionHeader } from '../components/common/SectionHeader';
import { useAuth } from '../context/AuthContext';

export function DashboardHome() {
  const { user, logout } = useAuth();
  const [panelQuery, setPanelQuery] = useState('');
  const [toast, setToast] = useState(null);

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

  const lastLoginDisplay = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString()
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

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      showToast('success', 'Email copied to clipboard');
    } catch {
      showToast('error', 'Unable to copy email');
    }
  };

  const resetSearch = () => {
    setPanelQuery('');
    showToast('success', 'Panel search reset');
  };

  return (
    <DashboardLayout user={user} onLogout={logout}>
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

      <div className="mb-6 md:mb-8 rounded-3xl border border-orange-100 bg-[radial-gradient(circle_at_0%_0%,#fff7ed_0%,#ffffff_42%,#f8fafc_100%)] p-4 sm:p-5 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#cc6f1c] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Unified Dashboard Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Start from one place, then jump to the right workspace for your responsibilities.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 backdrop-blur-sm border border-white shadow-sm p-4 w-full lg:w-auto lg:min-w-[280px]">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Profile Snapshot</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-700"><CircleCheckBig className="w-4 h-4 text-green-600" /> {roleLabel}</div>
              <div className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-gray-400" /> {user.email}</div>
              <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" /> {user.phoneNumber || 'Not added'}</div>
              <div className="flex items-center gap-2 text-gray-700"><Clock3 className="w-4 h-4 text-gray-400" /> {lastLoginDisplay}</div>
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
      </div>

      <div className="sticky top-20 z-20 mb-6 rounded-2xl border border-gray-100 bg-white/90 backdrop-blur px-3 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Quick Actions</span>
          <Link to="/dashboard" className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Refresh Hub
          </Link>
          {quickLinks[0] && (
            <Link to={quickLinks[0].to} className={`${buttonBase} bg-[#FF9933] text-white hover:bg-[#e8871e]`}>
              Open Primary Panel
            </Link>
          )}
          <button
            type="button"
            onClick={copyEmail}
            className={`${buttonBase} border border-gray-200 text-gray-700 hover:border-[#FF9933] hover:text-[#FF9933]`}
          >
            <Copy className="w-3.5 h-3.5" /> Copy Email
          </button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white bg-white/85 backdrop-blur-sm p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
            <p className="mt-2 text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-gray-500 mt-1">Shortcuts</span>
        {quickLinks.map((item) => (
          <Link
            key={`shortcut-${item.key}`}
            to={item.to}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.to}
              className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-white shadow-sm p-5 md:p-6 hover:border-[#FF9933] hover:shadow-md hover:-translate-y-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9933]"
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
      </div>
    </DashboardLayout>
  );
}
