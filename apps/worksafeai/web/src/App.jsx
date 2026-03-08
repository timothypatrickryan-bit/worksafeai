import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompanyOnboardingPage from './pages/CompanyOnboardingPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import DashboardPage from './pages/DashboardPage';
import JTSAListPage from './pages/JTSAListPage';
import JTSADetailPage from './pages/JTSADetailPage';
import CreateJTSAPage from './pages/CreateJTSAPage';
import BillingPage from './pages/BillingPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function OnboardingRequiredRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!user?.companyId) {
          setOnboardingStatus(false);
          return;
        }
        
        const response = await fetch(`http://localhost:3000/api/companies/${user.companyId}/profile`, {
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOnboardingStatus(data.onboardingCompleted === true);
        } else {
          setOnboardingStatus(false);
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setOnboardingStatus(false);
      }
    };

    if (isAuthenticated && user?.companyId) {
      checkOnboarding();
    }
  }, [isAuthenticated, user?.companyId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (onboardingStatus === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">Checking onboarding status...</p></div>;
  }

  if (onboardingStatus === false) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      initializeAuth();
      setInitialized(true);
    } catch (error) {
      console.error('Auth init error:', error);
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">Loading...</p></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <CompanyOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <OnboardingRequiredRoute>
              <DashboardPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/jtsa"
          element={
            <OnboardingRequiredRoute>
              <JTSAListPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/jtsa/create"
          element={
            <OnboardingRequiredRoute>
              <CreateJTSAPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/jtsa/:id"
          element={
            <OnboardingRequiredRoute>
              <JTSADetailPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/company-profile"
          element={
            <OnboardingRequiredRoute>
              <CompanyProfilePage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <OnboardingRequiredRoute>
              <BillingPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <OnboardingRequiredRoute>
              <AdminPage />
            </OnboardingRequiredRoute>
          }
        />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
