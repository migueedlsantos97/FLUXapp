import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Mail } from 'lucide-react';
import { WardenLogo } from './WardenLogo';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const LoginScreen: React.FC = () => {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearState = () => {
    setError('');
    setSuccessMessage('');
  };

  const switchMode = (newMode: AuthMode) => {
    clearState();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearState();

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await register(name, email, password);
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        setSuccessMessage(`Recovery link sent to ${email}`);
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');

      // If user exists during signup, suggest login
      if (mode === 'signup' && err.message?.includes('exists')) {
        setTimeout(() => switchMode('login'), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google login failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-main p-8 transition-all duration-300">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-4">
            <WardenLogo size={100} showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-main tracking-tight uppercase">WARDEN</h1>
          <p className="text-slate-500 text-sm mt-2">
            {mode === 'login' && 'Welcome back, Guardian.'}
            {mode === 'signup' && 'Initialize your financial architecture.'}
            {mode === 'forgot-password' && 'Recover access protocols.'}
          </p>
        </div>

        <div className="space-y-4">

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode !== 'forgot-password' && (
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder={mode === 'signup' ? "Create a strong password" : "Enter password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                <span className="font-medium mr-1">Error:</span> {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center">
                <Mail className="w-4 h-4 mr-2" /> {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {mode === 'login' && 'Access Terminal'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot-password' && 'Send Recovery Link'}
            </Button>
          </form>

          {/* Social Auth (Google) */}
          {mode !== 'forgot-password' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface text-muted uppercase tracking-widest text-[10px] font-bold">Protocol Connection</span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full relative justify-center"
                onClick={handleGoogleLogin}
                isLoading={isGoogleLoading}
              >
                {!isGoogleLoading && (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Google
              </Button>
            </>
          )}

          {/* Footer / Toggle Mode */}
          <div className="pt-4 text-center">
            {mode === 'login' && (
              <p className="text-sm text-muted">
                New user?{' '}
                <button onClick={() => switchMode('signup')} className="text-sentry-active font-bold hover:underline">
                  Create an account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-sentry-active font-bold hover:underline">
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot-password' && (
              <button
                onClick={() => switchMode('login')}
                className="flex items-center justify-center w-full text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};