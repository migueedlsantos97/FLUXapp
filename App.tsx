import * as React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingPremium } from './components/OnboardingPremium';
import { Dashboard } from './components/Dashboard';
import { SecurityOverlay } from './components/SecurityOverlay';

// Inner component to handle routing based on auth state and setup status
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { settings } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!settings.setupComplete) {
    return <OnboardingPremium />;
  }

  return (
    <>
      <Dashboard />
      <SecurityOverlay />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;