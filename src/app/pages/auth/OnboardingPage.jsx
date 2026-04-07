import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { User, Phone, AlertCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleHint = user?.role === 'admin'
    ? 'You have admin privileges. Keep your account secure.'
    : user?.role === 'moderator'
      ? 'As moderator, you can review and resolve queue items.'
      : user?.role === 'politician'
        ? 'As politician, you can publish announcements and respond to issues.'
        : 'As citizen, you can report complaints and track updates.';

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.onboardingCompleted !== false) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Full name should be at least 3 characters.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    if (!/^[0-9+() -]{7,20}$/.test(phoneNumber.trim())) {
      setError('Phone number is invalid. Use 7-20 digits/chars.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await completeOnboarding({
        email: user.email,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Complete your profile</h1>
          <p className="text-sm text-gray-500">One last step before entering BharatLink.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs text-blue-900">
          {roleHint}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.auth.namePh}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#FF9933] hover:bg-[#ffaa55] disabled:opacity-60 text-white font-bold text-sm transition-colors shadow-sm"
          >
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Finish onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
}
