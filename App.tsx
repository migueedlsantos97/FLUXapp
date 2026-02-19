import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { LoginScreen } from './components/LoginScreen';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';

// Inner component to handle routing based on auth state and setup status
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { settings } = useStore();

  // --- BYPASS TEMPORAL PARA REVISIÓN FINAL ---
  /*
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!settings.setupComplete) {
    return <SetupScreen />;
  }
  */

  return <Dashboard />;
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