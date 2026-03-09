import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompaniesCreatePage from './pages/companies/CreatePage';
import CompanyDetailPage from './pages/companies/DetailPage';
import EmployeesPage from './pages/EmployeesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import Toast from './components/Toast';
import './index.css';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // If there's a token but it's expired, the getter returns false
  return (token && isAuthenticated) ? children : <Navigate to="/login" replace />;
}

function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Auth init error:', error);
      }
    } finally {
      setInitialized(true);
    }
  }, [initializeAuth]);

  // Listen for 401 events from the API client to redirect to login
  useEffect(() => {
    const handler = () => {
      window.location.href = '/login';
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/companies/create" element={<CompaniesCreatePage />} />
                    <Route path="/companies/:id" element={<CompanyDetailPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
