import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Phase 1: Check for persisted session in localStorage
    // Warden Migration: Check for warden key first, fallback to flux
    let storedUser = localStorage.getItem('warden_auth_user');
    if (!storedUser) {
      storedUser = localStorage.getItem('flux_auth_user');
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    // Phase 1: Simulated Async Login
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && pass) {
          // Simulation: Allow any email/pass for now, or specific demo account
          const mockUser: User = {
            id: 'u_' + Math.random().toString(36).substr(2, 9),
            email: email,
            name: email.split('@')[0], // Default name from email
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            provider: 'local'
          };
          setUser(mockUser);
          localStorage.setItem('warden_auth_user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulation: Check if user exists (Mocking DB check)
        if (email === 'demo@flux.com') {
          setIsLoading(false);
          reject(new Error("Account already exists. Please login."));
          return;
        }

        if (email && pass && name) {
          const mockUser: User = {
            id: 'u_' + Math.random().toString(36).substr(2, 9),
            email: email,
            name: name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            provider: 'local'
          };
          setUser(mockUser);
          localStorage.setItem('warden_auth_user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error("Please fill in all fields"));
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(`Password reset link sent to ${email}`);
        resolve();
        setIsLoading(false);
      }, 1000);
    });
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Phase 1: Simulated Google Login Provider
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'u_google_' + Math.random().toString(36).substr(2, 9),
          email: 'alex.doe@gmail.com',
          name: 'Alex Doe',
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          provider: 'google'
        };
        setUser(mockUser);
        localStorage.setItem('flux_auth_user', JSON.stringify(mockUser));
        resolve();
        setIsLoading(false);
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('warden_auth_user');
    localStorage.removeItem('flux_auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      resetPassword,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};