import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CitizenDashboard } from './components/dashboards/CitizenDashboard';
import { PoliticianDashboard } from './components/dashboards/PoliticianDashboard';
import { ModeratorDashboard } from './components/dashboards/ModeratorDashboard';

// Re-export types so other modules that still use './App' continue to work
export type { UserRole, User } from './types';

function AppRoutes() {
  const { user, logout } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <LandingPage />}
      />
      <Route
        path="/signin"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <SignUpPage />}
      />

      {/* Protected dashboard routes */}
      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/citizen"
        element={
          user?.role === 'citizen' ? (
            <CitizenDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/politician"
        element={
          user?.role === 'politician' ? (
            <PoliticianDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/moderator"
        element={
          user?.role === 'moderator' ? (
            <ModeratorDashboard user={user} onLogout={logout} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
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
