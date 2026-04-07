import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import govLogo from '../../../assets/images/government-of-india.jpg';

export function SignInPage() {
  const navigate = useNavigate();
  const { login, googleSignIn } = useAuth();
  const { t } = useLanguage();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const destinationForUser = (authUser) => (authUser?.onboardingCompleted === false ? '/onboarding' : `/${authUser.role}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authUser = await login(email, password);
      navigate(destinationForUser(authUser), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const authUser = await googleSignIn(credential);
      navigate(destinationForUser(authUser), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Logo + Title */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden p-1">
              <img src={govLogo} alt="BharatLink" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">BharatLink</h1>
              <p className="text-sm text-gray-500 mt-0.5">{t.auth.siSub}</p>
            </div>
          </div>

          <div className="pt-2">
            {googleClientId ? (
              <GoogleSignInButton
                clientId={googleClientId}
                disabled={loading}
                onCredential={handleGoogleCredential}
                onError={(err) => setError(err instanceof Error ? err.message : 'Google Sign-In unavailable.')}
              />
            ) : (
              <div className="relative pt-3">
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Set VITE_GOOGLE_CLIENT_ID
                </span>
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed opacity-60"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
                  {t.auth.google}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">{t.auth.orEmail}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPh}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPh}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#FF9933] hover:bg-[#ffaa55] disabled:opacity-60 text-white font-bold text-sm transition-colors shadow-sm"
            >
              {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.auth.siBtn}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            {t.auth.noAccount}{' '}
            <Link to="/signup" className="font-semibold text-[#FF9933] hover:underline">
              {t.auth.suLink}
            </Link>
          </p>

        </div>

        {/* Back to home */}
        <p className="text-center mt-4 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-600 transition-colors">{t.auth.back}</Link>
        </p>
      </div>
    </div>
  );
}

