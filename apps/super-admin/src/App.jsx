import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useAppStore from './stores/appStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesListPage from './pages/companies/ListPage';
import CompaniesCreatePage from './pages/companies/CreatePage';
import CompanyDetailPage from './pages/companies/DetailPage';
import EmployeesPage from './pages/EmployeesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token } = useAuthStore();
  const { selectedApp } = useAppStore();

  return (
    <ErrorBoundary>
      <Toast />
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* WorkSafeAI Routes */}
        {selectedApp === 'worksafeai' && (
          <>
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompaniesListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompaniesCreatePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompanyDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmployeesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SubscriptionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AuditLogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* Common Routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
