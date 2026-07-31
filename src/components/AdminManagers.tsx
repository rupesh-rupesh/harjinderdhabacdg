import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, ShieldCheck, Key, Settings, AlertCircle, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';

export default function AdminManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: {
      canEditMenu: false,
      canControlAccess: false,
    }
  });

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/admin/managers');
      if (res.ok) {
        setManagers(await res.json());
      }
    } catch (e) {
      toast.error('We were unable to load the managers list at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('perm_')) {
      const permName = name.replace('perm_', '');
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleEdit = (manager: any) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name || '',
      email: manager.email || '',
      password: '',
      permissions: manager.permissions || { canEditMenu: false, canControlAccess: false }
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingManager(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: { canEditMenu: false, canControlAccess: false }
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Manager',
      message: 'Are you sure you want to delete this manager account? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/managers/${id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success('Manager deleted');
            fetchManagers();
          } else {
            toast.error('The deletion request could not be completed.');
          }
        } catch (e) {
          toast.error('A connection error occurred. Please verify your network and try again.');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager && formData.password.length < 6) {
      toast.error('The provided password must contain at least 6 characters.');
      return;
    }
    
    try {
      const url = editingManager ? `/api/admin/managers/${editingManager.id}` : '/api/admin/managers';
      const method = editingManager ? 'PUT' : 'POST';
      const body = JSON.stringify({
        ...formData,
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (res.ok) {
        toast.success(editingManager ? 'Manager updated' : 'Manager created');
        setIsFormOpen(false);
        fetchManagers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'The requested operation could not be completed.');
      }
    } catch (error) {
      toast.error('A connection error occurred. Please verify your network and try again.');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dhaba-orange"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Managers</h2>
          <p className="text-stone-500">Control manager accounts and permissions</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-dhaba-dark text-white px-5 py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Manager
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 font-bold text-stone-600 text-sm">Manager</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Email</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Permissions</th>
                <th className="p-4 font-bold text-stone-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(manager => (
                <tr key={manager.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold uppercase">
                        {(manager.name || 'M')[0]}
                      </div>
                      {manager.name}
                    </div>
                  </td>
                  <td className="p-4 text-stone-600 font-medium">{manager.email}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {manager.permissions?.canEditMenu && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                          Menu Edit
                        </span>
                      )}
                      {manager.permissions?.canControlAccess && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold border border-purple-100">
                          Access Control
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(manager)} className="p-2 text-stone-400 hover:text-dhaba-orange hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(manager.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-500 font-medium">No managers are currently registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-dhaba-orange" />
                {editingManager ? 'Edit Manager' : 'Add New Manager'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-medium text-stone-800" placeholder="e.g. John Doe" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">Email (Used for login)</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!editingManager} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-medium text-stone-800 disabled:opacity-50" placeholder="manager@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">
                    {editingManager ? 'Change Password (Leave blank to keep current)' : 'Password'}
                  </label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingManager} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow font-medium text-stone-800" placeholder="Min 6 characters" minLength={6} />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-stone-500" />
                  Permissions
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                    <div>
                      <span className="block font-bold text-stone-800">Edit Menu</span>
                      <span className="text-xs text-stone-500">Allow adding, editing, or deleting menu items</span>
                    </div>
                    <div className="relative">
                      <input type="checkbox" name="perm_canEditMenu" checked={formData.permissions.canEditMenu} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dhaba-orange"></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                    <div>
                      <span className="block font-bold text-stone-800">Control Access</span>
                      <span className="text-xs text-stone-500">Allow managing other sub-roles (if any)</span>
                    </div>
                    <div className="relative">
                      <input type="checkbox" name="perm_canControlAccess" checked={formData.permissions.canControlAccess} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dhaba-orange"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-dhaba-dark text-white rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center shadow-md">
                  <Save className="w-5 h-5 mr-2" />
                  {editingManager ? 'Save Changes' : 'Create Manager'}
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
