import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User as UserType } from '../../types';
import { LogOut, Settings, Bell, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import govLogo from '../../../assets/images/government-of-india.jpg';

interface DashboardLayoutProps {
  user: UserType;
  onLogout: () => void;
  children: ReactNode;
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const { lang, setLang, t, languages } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'citizen':    return 'bg-orange-100 text-[#FF9933] border border-orange-200';
      case 'politician': return 'bg-green-100 text-[#138808] border border-green-200';
      case 'moderator':  return 'bg-blue-100 text-[#000080] border border-blue-200';
      case 'admin':      return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:           return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    const key = role as keyof typeof t.auth.roles;
    return t.auth.roles[key] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tricolor stripe */}
      <div style={{ background: 'linear-gradient(to right, #FF9933 0%, #FF9933 33.33%, #ffffff 33.33%, #ffffff 66.67%, #138808 66.67%, #138808 100%)', height: '4px' }} />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={govLogo}
                alt="Government of India"
                className="h-10 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <div className="text-xl font-extrabold tracking-tight leading-tight">
                  <span style={{ color: '#FF9933' }}>Citizen</span>
                  <span style={{ color: '#138808' }}>Connect</span>
                </div>
                <div className="text-[10px] font-medium tracking-widest uppercase leading-none" style={{ color: '#000080' }}>
                  {t.nav.tagline}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-[#FF9933] hover:bg-orange-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{lang}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-48 overflow-hidden">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                          lang === l.code
                            ? 'bg-orange-50 text-[#FF9933] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-gray-400 w-7 flex-shrink-0">{l.code}</span>
                        <span className="flex-1">{l.native}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-500 hover:text-[#FF9933] hover:bg-orange-50 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-500 hover:text-[#FF9933] hover:bg-orange-50 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* User info */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200 ml-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: '#FF9933' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRoleBadgeStyle(user.role || '')}`}>
                    {getRoleLabel(user.role || '')}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
