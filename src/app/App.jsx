import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CitizenDashboard } from './components/dashboards/CitizenDashboard';
import { PoliticianDashboard } from './components/dashboards/PoliticianDashboard';
import { ModeratorDashboard } from './components/dashboards/ModeratorDashboard';

function AppRoutes() {
  const { user, logout } = useAuth();
  const homeRoute = user?.onboardingCompleted === false ? '/onboarding' : `/${user?.role}`;

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={user ? <Navigate to={homeRoute} replace /> : <LandingPage />}
      />
      <Route
        path="/signin"
        element={user ? <Navigate to={homeRoute} replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={homeRoute} replace /> : <SignUpPage />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/signin" replace />}
      />

      {/* Protected dashboard routes */}
      <Route
        path="/admin"
        element={
          user?.role === 'admin' && user?.onboardingCompleted !== false ? (
            <AdminDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={user ? '/onboarding' : '/signin'} replace />
          )
        }
      />
      <Route
        path="/citizen"
        element={
          user?.role === 'citizen' && user?.onboardingCompleted !== false ? (
            <CitizenDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={user ? '/onboarding' : '/signin'} replace />
          )
        }
      />
      <Route
        path="/politician"
        element={
          user?.role === 'politician' && user?.onboardingCompleted !== false ? (
            <PoliticianDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={user ? '/onboarding' : '/signin'} replace />
          )
        }
      />
      <Route
        path="/politicion"
        element={<Navigate to="/politician" replace />}
      />
      <Route
        path="/moderator"
        element={
          user?.role === 'moderator' && user?.onboardingCompleted !== false ? (
            <ModeratorDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to={user ? '/onboarding' : '/signin'} replace />
          )
        }
      />
      <Route
        path="/mod"
        element={<Navigate to="/moderator" replace />}
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
