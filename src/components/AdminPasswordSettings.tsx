import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Eye, EyeOff, Save, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPasswordSettings() {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [confirmManagerPassword, setConfirmManagerPassword] = useState('');

  const [currentAdminPassword, setCurrentAdminPassword] = useState('ADMIN2043W');
  const [currentManagerPassword, setCurrentManagerPassword] = useState('MANAGER2043W');

  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showConfirmAdminPass, setShowConfirmAdminPass] = useState(false);
  const [showManagerPass, setShowManagerPass] = useState(false);
  const [showConfirmManagerPass, setShowConfirmManagerPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchPasswords = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/auth/dashboard-passwords');
      if (res.ok) {
        const data = await res.json();
        setCurrentAdminPassword(data.adminPassword || 'ADMIN2043W');
        setCurrentManagerPassword(data.managerPassword || 'MANAGER2043W');
        setAdminPassword(data.adminPassword || 'ADMIN2043W');
        setConfirmAdminPassword(data.adminPassword || 'ADMIN2043W');
        setManagerPassword(data.managerPassword || 'MANAGER2043W');
        setConfirmManagerPassword(data.managerPassword || 'MANAGER2043W');
      }
    } catch (e) {
      console.error('Failed to load dashboard passwords:', e);
      setAdminPassword('ADMIN2043W');
      setConfirmAdminPassword('ADMIN2043W');
      setManagerPassword('MANAGER2043W');
      setConfirmManagerPassword('MANAGER2043W');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPassword !== confirmAdminPassword) {
      toast.error('The provided Admin passwords do not match. Please verify and try again.');
      return;
    }

    if (managerPassword !== confirmManagerPassword) {
      toast.error('The provided Manager passwords do not match. Please verify and try again.');
      return;
    }

    if (!adminPassword.trim() || !managerPassword.trim()) {
      toast.error('Password fields cannot be left empty. Please provide a valid password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/update-dashboard-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: adminPassword.trim(),
          managerPassword: managerPassword.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentAdminPassword(data.adminPassword);
        setCurrentManagerPassword(data.managerPassword);
        toast.success('Dashboard passwords updated successfully!');
      } else {
        toast.error('We were unable to update the passwords at this time.');
      }
    } catch (err) {
      console.error(err);
      toast.error('A network error occurred while updating the passwords. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset both Admin and Manager passwords back to default values (ADMIN2043W / MANAGER2043W)?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-dashboard-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: 'ADMIN2043W',
          managerPassword: 'MANAGER2043W',
        }),
      });

      if (res.ok) {
        setAdminPassword('ADMIN2043W');
        setConfirmAdminPassword('ADMIN2043W');
        setManagerPassword('MANAGER2043W');
        setConfirmManagerPassword('MANAGER2043W');
        setCurrentAdminPassword('ADMIN2043W');
        setCurrentManagerPassword('MANAGER2043W');
        toast.success('Passwords reset to defaults!');
      }
    } catch (e) {
      toast.error('An error occurred while attempting to reset the passwords.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 flex items-center justify-center text-stone-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading password settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-dhaba-dark flex items-center gap-2">
            <Shield className="w-7 h-7 text-[var(--color-gold)]" />
            Dashboard Password Security
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage and update access passwords for the Admin Dashboard and Manager Dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          disabled={loading}
          className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Current Status Card */}
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-800 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">Admin Dashboard Password</div>
            <div className="text-lg font-mono font-bold text-dhaba-dark mt-1">
              {currentAdminPassword ? '••••••••••••' : 'ADMIN2043W'}
            </div>
            <p className="text-xs text-amber-800/80 mt-1">Required when opening /admin route</p>
          </div>
        </div>

        {/* Manager Current Status Card */}
        <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-800 rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">Manager Dashboard Password</div>
            <div className="text-lg font-mono font-bold text-dhaba-dark mt-1">
              {currentManagerPassword ? '••••••••••••' : 'MANAGER2043W'}
            </div>
            <p className="text-xs text-blue-800/80 mt-1">Required when opening /manager route</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admin Password Form Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Shield className="w-5 h-5 text-[var(--color-gold)]" />
            <h2 className="text-lg font-bold text-stone-800">Change Admin Dashboard Password</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase">
                New Admin Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 pr-10 text-stone-800 text-sm focus:outline-none focus:border-[var(--color-gold)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase">
                Confirm Admin Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmAdminPass ? 'text' : 'password'}
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Confirm admin password"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 pr-10 text-stone-800 text-sm focus:outline-none focus:border-[var(--color-gold)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmAdminPass(!showConfirmAdminPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Password Form Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-stone-800">Change Manager Dashboard Password</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase">
                New Manager Password
              </label>
              <div className="relative">
                <input
                  type={showManagerPass ? 'text' : 'password'}
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  placeholder="Enter new manager password"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 pr-10 text-stone-800 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowManagerPass(!showManagerPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showManagerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase">
                Confirm Manager Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmManagerPass ? 'text' : 'password'}
                  value={confirmManagerPassword}
                  onChange={(e) => setConfirmManagerPassword(e.target.value)}
                  placeholder="Confirm manager password"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 pr-10 text-stone-800 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmManagerPass(!showConfirmManagerPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmManagerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-gold)] to-amber-600 hover:brightness-110 text-stone-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Password Changes
          </button>
        </div>
      </form>
    </div>
  );
}
