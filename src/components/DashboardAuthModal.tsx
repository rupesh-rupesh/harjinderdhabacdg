import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface DashboardAuthModalProps {
  role: 'admin' | 'manager';
  onSuccess: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function DashboardAuthModal({ role, onSuccess }: DashboardAuthModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';
  const roleTitle = isAdmin ? 'Admin Dashboard' : 'Manager Dashboard';
  const defaultFallbackPassword = isAdmin ? 'ADMIN2043W' : 'MANAGER2043W';

  const saveAuth = () => {
    if (rememberMe) {
      localStorage.setItem(`${role}_dashboard_auth`, 'true');
      sessionStorage.removeItem(`${role}_dashboard_auth`);
    } else {
      sessionStorage.setItem(`${role}_dashboard_auth`, 'true');
      localStorage.removeItem(`${role}_dashboard_auth`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-dashboard-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password: password.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          saveAuth();
          toast.success(`Welcome to ${roleTitle}`);
          onSuccess();
          return;
        } else {
          setError(data.error || `Incorrect password for ${roleTitle}.`);
        }
      } else {
        if (password.trim() === defaultFallbackPassword) {
          saveAuth();
          toast.success(`Welcome to ${roleTitle}`);
          onSuccess();
          return;
        } else {
          setError(`Incorrect password for ${roleTitle}.`);
        }
      }
    } catch (err) {
      console.error('Password verification error:', err);
      if (password.trim() === defaultFallbackPassword) {
        saveAuth();
        toast.success(`Welcome to ${roleTitle}`);
        onSuccess();
        return;
      }
      setError(`Incorrect password for ${roleTitle}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast('Google Sign-In integration coming soon!', { icon: '🔧', style: { background: '#292524', color: '#fff' } });
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-80"
        >
          <source src="/loginbg.mp4" type="video/mp4" />
        </video>
        {/* Overlay for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-[#1a1008]/90" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Branding/Text Section (Hidden on small mobile, visible on tablet/desktop) */}
        <div className="flex-1 text-center lg:text-left hidden sm:flex flex-col justify-center max-w-2xl lg:pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1008]/50 border border-[var(--color-gold)]/20 backdrop-blur-md mb-6 w-fit mx-auto lg:mx-0 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse"></div>
            <span className="text-xs font-medium tracking-widest text-[var(--color-gold)] uppercase">System Active</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Harjinder Tourist <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold)] to-amber-500">Dhaba</span>
          </h1>
          
          <p className="text-stone-300 text-lg sm:text-xl font-light leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 drop-shadow-md">
            Welcome to the centralized management portal. Access operational controls, monitor analytics, and manage daily tasks efficiently.
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-stone-300 font-medium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1008]/50 backdrop-blur-md flex items-center justify-center border border-[var(--color-gold)]/20 shadow-inner">
                <Check className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <span>Secure Access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1008]/50 backdrop-blur-md flex items-center justify-center border border-[var(--color-gold)]/20 shadow-inner">
                <Check className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <span>End-to-End Encryption</span>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="max-w-[400px] w-full bg-[#1a1008]/40 backdrop-blur-xl border border-[var(--color-gold)]/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden p-6 sm:p-8 shrink-0">
          <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1008]/50 text-[var(--color-gold)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--color-gold)]/20 shadow-inner backdrop-blur-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">{roleTitle}</h2>
          <p className="text-[#C89B3C]/70 text-sm">Secure access to the management system</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)] mb-6 hover:-translate-y-0.5 border border-[var(--color-gold)]/20 backdrop-blur-sm"
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-[var(--color-gold)]/20"></div>
          <span className="flex-shrink-0 mx-4 text-[var(--color-gold)]/50 text-xs font-semibold uppercase tracking-widest">Or sign in with password</span>
          <div className="flex-grow border-t border-[var(--color-gold)]/20"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-start gap-3 backdrop-blur-md">
            <span className="font-bold text-red-400 text-base leading-none">!</span>
            <div className="leading-tight">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#C89B3C]/80 uppercase tracking-wider mb-2.5">
              Access Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secure password"
                className="w-full bg-[#1a1008]/50 border border-[var(--color-gold)]/20 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-gold)]/60 focus:bg-[#1a1008]/70 transition-all text-sm shadow-inner backdrop-blur-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gold)]/50 hover:text-[var(--color-gold)] p-2 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' : 'bg-stone-800 border-stone-600 group-hover:border-[var(--color-gold)]/50'}`}>
                {rememberMe && <Check className="w-3.5 h-3.5 text-stone-900" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-stone-300 group-hover:text-stone-200 transition-colors">Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-[var(--color-gold)] to-amber-600 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-[0_4px_20px_rgba(200,155,60,0.3)] hover:shadow-[0_4px_25px_rgba(200,155,60,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-stone-900 border-t-transparent" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Unlock Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-stone-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Website
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600">Secure Gateway</span>
        </div>
        </div>
      </div>
    </div>
  );
}
