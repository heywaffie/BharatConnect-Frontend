import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardHome } from './pages/DashboardHome';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CitizenDashboard } from './components/dashboards/CitizenDashboard';
import { PoliticianDashboard } from './components/dashboards/PoliticianDashboard';
import { ModeratorDashboard } from './components/dashboards/ModeratorDashboard';

function AppRoutes() {
  const { user, logout } = useAuth();
  const homeRoute = user?.onboardingCompleted === false ? '/onboarding' : '/dashboard';
  const isAuthenticated = Boolean(user);
  const isSuspended = String(user?.status || '').toLowerCase() === 'suspended';

  const canAccessRole = (role) => {
    if (!user || isSuspended || user.onboardingCompleted === false) return false;
    return user.role === role;
  };

  const guardRedirect = () => {
    if (!user) return '/signin';
    if (isSuspended) return '/signin';
    if (user.onboardingCompleted === false) return '/onboarding';
    return '/dashboard';
  };

  const AliasRedirect = ({ to }) => {
    const location = useLocation();
    return <Navigate to={`${to}${location.search || ''}`} replace />;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LandingPage />}
      />
      <Route
        path="/signin"
        element={isAuthenticated && !isSuspended ? <Navigate to={homeRoute} replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated && !isSuspended ? <Navigate to={homeRoute} replace /> : <SignUpPage />}
      />
      <Route
        path="/onboarding"
        element={isAuthenticated && !isSuspended ? <OnboardingPage /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated && !isSuspended ? <DashboardHome /> : <Navigate to="/signin" replace />}
      />

      {/* Protected dashboard routes */}
      <Route
        path="/admin"
        element={
          canAccessRole('admin') ? (
            <AdminDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={guardRedirect()} replace />
          )
        }
      />
      <Route
        path="/citizen"
        element={
          canAccessRole('citizen') ? (
            <CitizenDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={guardRedirect()} replace />
          )
        }
      />
      <Route
        path="/politician"
        element={
          canAccessRole('politician') ? (
            <PoliticianDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={guardRedirect()} replace />
          )
        }
      />
      <Route
        path="/politicion"
        element={<AliasRedirect to="/politician" />}
      />
      <Route
        path="/poicitfrn"
        element={<AliasRedirect to="/politician" />}
      />
      <Route
        path="/moderator"
        element={
          canAccessRole('moderator') ? (
            <ModeratorDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={guardRedirect()} replace />
          )
        }
      />
      <Route
        path="/mod"
        element={<AliasRedirect to="/moderator" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
