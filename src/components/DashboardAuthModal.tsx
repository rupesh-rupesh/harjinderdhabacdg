import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface DashboardAuthModalProps {
  role: 'admin' | 'manager';
  onSuccess: () => void;
}

export default function DashboardAuthModal({ role, onSuccess }: DashboardAuthModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';
  const roleTitle = isAdmin ? 'Admin Dashboard' : 'Manager Dashboard';
  const defaultFallbackPassword = isAdmin ? 'ADMIN2043W' : 'MANAGER2043W';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in both Enter Password and Confirm Password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match!');
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
          sessionStorage.setItem(`${role}_dashboard_auth`, 'true');
          toast.success(`Welcome to ${roleTitle}`);
          onSuccess();
          return;
        } else {
          setError(data.error || `Incorrect password for ${roleTitle}.`);
        }
      } else {
        // Fallback check if server error or offline
        if (password.trim() === defaultFallbackPassword) {
          sessionStorage.setItem(`${role}_dashboard_auth`, 'true');
          toast.success(`Welcome to ${roleTitle}`);
          onSuccess();
          return;
        } else {
          setError(`Incorrect password for ${roleTitle}.`);
        }
      }
    } catch (err) {
      console.error('Password verification error:', err);
      // Fallback check against default password
      if (password.trim() === defaultFallbackPassword) {
        sessionStorage.setItem(`${role}_dashboard_auth`, 'true');
        toast.success(`Welcome to ${roleTitle}`);
        onSuccess();
        return;
      }
      setError(`Incorrect password for ${roleTitle}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-800 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--color-gold)]/20 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-1">{roleTitle}</h2>
          <p className="text-stone-400 text-sm">Please enter your password to access dashboard controls</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5">
            <span className="font-bold text-red-500 text-base leading-none">!</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-stone-500 focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-stone-500 focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--color-gold)] to-amber-600 hover:brightness-110 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-stone-900 border-t-transparent" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Submit & Access Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-400">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <span className="text-stone-500 font-mono text-[11px]">Harjinder Dhaba</span>
        </div>
      </div>
    </div>
  );
}
