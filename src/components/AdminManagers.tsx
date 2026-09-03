import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit, Trash2, ShieldCheck, Settings, Save, X,
  Eye, EyeOff, Mail, KeyRound, Copy, CheckCheck, RefreshCw,
  Clock, UserCheck, UserX, Send, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generatePassword(len = 12): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatDate(d: string | null | undefined): string {
  if (!d) return 'Never';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(d));
  } catch { return 'Unknown'; }
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy"
      className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
    >
      {copied
        ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5 text-stone-400 hover:text-stone-600" />}
    </button>
  );
}

// ─── Success credential dialog ────────────────────────────────────────────────
interface CredentialCardProps {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}



// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingManager, setEditingManager] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}});


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    permissions: { canEditMenu: false, canControlAccess: false },
  });
  const [showPassword, setShowPassword] = useState(false);

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) setManagers(await res.json());
    } catch {
      toast.error('Could not load managers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchManagers(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('perm_')) {
      const permName = name.replace('perm_', '');
      setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [permName]: checked } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleAddNew = () => {
    setEditingManager(null);
    const pw = generatePassword();
    setFormData({ name: '', email: '', password: pw, role: 'manager', permissions: { canEditMenu: false, canControlAccess: false } });
    setShowPassword(true);
    setIsFormOpen(true);
  };

  const handleEdit = (manager: any) => {
    setEditingManager(manager);
    setFormData({ name: manager.name || '', email: manager.email || '', password: '', role: manager.role || 'manager', permissions: manager.permissions || { canEditMenu: false, canControlAccess: false } });
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Manager',
      message: `Are you sure you want to delete "${name}"? This cannot be undone and the manager will lose dashboard access.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
          if (res.ok) { toast.success('Staff member deleted'); fetchManagers(); }
          else toast.error('Deletion failed.');
        } catch { toast.error('Network error.'); }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsSaving(true);
    // Ensure name is uppercase before submitting
    const payload = { ...formData, name: formData.name.toUpperCase() };
    try {
      const url    = editingManager ? `/api/admin/staff/${editingManager.id}` : '/api/admin/staff';
      const method = editingManager ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (!editingManager) {
          toast.success('Manager created successfully. Email sent!');
        } else {
          toast.success('Manager updated successfully');
        }

        setIsFormOpen(false);
        fetchManagers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Operation failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="p-16 flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dhaba-orange" />
      <p className="text-stone-400 text-sm">Loading managers…</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Manage Staff</h2>
          <p className="text-stone-500 text-sm mt-1">
            Create and manage Admin and Manager accounts for the system.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-dhaba-dark text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-stone-800 transition-all hover:shadow-lg flex items-center gap-2 shadow-md shrink-0 self-start sm:self-auto hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Manager cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {managers.map(manager => (
          <div
            key={manager.id}
            className="relative bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
          >
            {/* Top decorative gradient line */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${manager.role === 'admin' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-stone-400 to-stone-600'}`} />

            {/* Avatar + name */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-serif font-bold text-2xl uppercase shadow-md ${manager.role === 'admin' ? 'bg-gradient-to-br from-amber-50 to-amber-200 text-amber-900 border border-amber-300/50' : 'bg-gradient-to-br from-stone-50 to-stone-200 text-stone-800 border border-stone-300/50'}`}>
                  {(manager.name || 'S')[0]}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-extrabold text-stone-900 text-lg leading-tight uppercase tracking-tight">{manager.name}</h3>
                  <p className="text-sm text-stone-500 mt-0.5">{manager.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {manager.role === 'admin' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/80 text-amber-900 rounded-lg text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin
                      </span>
                    )}
                    {manager.isActive !== false
                      ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold tracking-wide"><UserCheck className="w-3.5 h-3.5 text-green-500" /> Active</span>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold tracking-wide"><UserX className="w-3.5 h-3.5 text-red-500" /> Inactive</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (Always visible on mobile, subtle on desktop) */}
            <div className="absolute top-5 right-5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleEdit(manager)}
                title="Edit"
                className="p-2.5 text-stone-400 hover:text-dhaba-orange hover:bg-orange-50 rounded-xl transition-colors shadow-sm bg-white border border-stone-100 hover:border-orange-200"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(manager.id, manager.name)}
                title="Delete"
                className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm bg-white border border-stone-100 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4" />

            {/* Last login */}
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-5 font-medium">
              <div className="p-1.5 rounded-lg bg-stone-50">
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <span>Last login: <span className="text-stone-700">{formatDate(manager.lastLogin || manager.last_login)}</span></span>
            </div>

            {/* Permission badges */}
            <div className="mt-auto flex flex-wrap gap-2">
              {manager.permissions?.canEditMenu && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 text-blue-700 border border-blue-200/50 rounded-xl text-xs font-bold shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Menu Edit
                </span>
              )}
              {manager.permissions?.canControlAccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 text-purple-700 border border-purple-200/50 rounded-xl text-xs font-bold shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Access Control
                </span>
              )}
              {!manager.permissions?.canEditMenu && !manager.permissions?.canControlAccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-500 border border-stone-200/50 rounded-xl text-xs font-bold shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  View Only
                </span>
              )}
            </div>
          </div>
        ))}

        {managers.length === 0 && (
          <div className="col-span-full py-20 text-center text-stone-500 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
            <Users className="w-14 h-14 mx-auto mb-4 text-stone-300" />
            <p className="font-bold text-stone-700 mb-1">No staff members yet</p>
            <p className="text-sm text-stone-400">Click <strong>Add Staff</strong> to create the first account.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal header */}
            <div className={`px-6 py-5 flex justify-between items-center ${editingManager ? 'bg-stone-50 border-b border-stone-100' : 'bg-gradient-to-r from-stone-900 to-stone-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${editingManager ? 'bg-dhaba-orange/10' : 'bg-white/10'}`}>
                  {editingManager
                    ? <Edit className="w-5 h-5 text-dhaba-orange" />
                    : <ShieldCheck className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h2 className={`text-lg font-bold leading-tight ${editingManager ? 'text-stone-900' : 'text-white'}`}>
                    {editingManager ? 'Edit Staff Member' : 'Create New Staff Member'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className={`p-1.5 rounded-xl transition-colors ${editingManager ? 'text-stone-400 hover:bg-stone-200' : 'text-stone-400 hover:bg-white/10'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. RAJESH KUMAR"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-medium text-stone-800 placeholder-stone-300 uppercase"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                  System Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${formData.role === 'manager' ? 'border-dhaba-orange bg-orange-50' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${formData.role === 'manager' ? 'text-amber-900' : 'text-stone-700'}`}>Manager</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.role === 'manager' ? 'border-dhaba-orange' : 'border-stone-300'}`}>
                        {formData.role === 'manager' && <div className="w-2 h-2 rounded-full bg-dhaba-orange" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500 leading-tight">Operational access for managing orders and billing.</span>
                    <input type="radio" name="role" value="manager" checked={formData.role === 'manager'} onChange={handleChange} className="sr-only" />
                  </label>
                  <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${formData.role === 'admin' ? 'border-dhaba-orange bg-orange-50' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${formData.role === 'admin' ? 'text-amber-900' : 'text-stone-700'}`}>Admin</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.role === 'admin' ? 'border-dhaba-orange' : 'border-stone-300'}`}>
                        {formData.role === 'admin' && <div className="w-2 h-2 rounded-full bg-dhaba-orange" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500 leading-tight">Full access to settings, menus, and staff management.</span>
                    <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} className="sr-only" />
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Email Address <span className="text-stone-400 normal-case font-normal">(used for login)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="staff@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-medium text-stone-800 placeholder-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                    {editingManager ? 'New Password' : 'Password'}
                    {editingManager && <span className="text-stone-400 normal-case font-normal ml-1">(leave blank to keep current)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setFormData(p => ({ ...p, password: generatePassword() })); setShowPassword(true); }}
                    className="text-xs text-dhaba-orange font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingManager}
                    minLength={6}
                    placeholder={editingManager ? 'Leave blank to keep current' : 'Min 6 characters'}
                    className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-mono text-stone-800 placeholder-stone-300 placeholder:font-sans"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <p className="text-xs text-stone-400 flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3" />
                    Make sure to copy and securely share this password.
                  </p>
                )}
              </div>



              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-dhaba-dark text-white rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-md text-sm disabled:opacity-60"
                >
                  {isSaving ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /><span>{editingManager ? 'Saving…' : 'Creating…'}</span></>
                  ) : editingManager ? (
                    <><Save className="w-4 h-4" /><span>Save Changes</span></>
                  ) : (
                    <><Save className="w-4 h-4" /><span>Create Staff Member</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
