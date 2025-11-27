import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, createUser, deleteUser, updateUserPassword } from '../services/authService';
import { Trash2, UserPlus, Shield, User as UserIcon, X, AlertCircle, Key, Check } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);

  // Password Reset State
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Username and password are required");
      return;
    }

    const success = createUser({
      username: newUsername,
      password: newPassword,
      role: newRole
    });

    if (success) {
      refreshUsers();
      setIsAddingUser(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      setError(null);
    } else {
      setError("User already exists");
    }
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      const success = deleteUser(username);
      if (success) {
        refreshUsers();
      } else {
        alert("Cannot delete this user.");
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resettingUser && resetPassword.trim()) {
      const success = updateUserPassword(resettingUser, resetPassword);
      if (success) {
        refreshUsers();
        setResettingUser(null);
        setResetPassword('');
      } else {
        alert("Failed to update password");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500">Manage users and permissions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
            Exit Dashboard
          </button>
        </div>

        {/* User Stats / Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="text-sm font-medium text-slate-500 uppercase">Total Users</div>
             <div className="text-3xl font-bold text-slate-900 mt-2">{users.length}</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="text-sm font-medium text-slate-500 uppercase">Admins</div>
             <div className="text-3xl font-bold text-slate-900 mt-2">
               {users.filter(u => u.role === 'admin').length}
             </div>
          </div>

          <button 
             onClick={() => setIsAddingUser(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UserPlus size={24} />
            <span className="font-bold">Create New User</span>
          </button>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">System Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <UserIcon size={16} />
                        </div>
                        <span className="font-medium text-slate-900">{user.username}</span>
                        {user.username === currentUser.username && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">You</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setResettingUser(user.username)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key size={18} />
                        </button>
                        {user.username !== 'superadmin' && user.username !== currentUser.username && (
                          <button 
                            onClick={() => handleDeleteUser(user.username)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scaleIn m-4 relative">
            <button 
              onClick={() => setIsAddingUser(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New User</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      checked={newRole === 'user'}
                      onChange={() => setNewRole('user')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">User</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Admin</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-2"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scaleIn m-4 relative">
            <button 
              onClick={() => { setResettingUser(null); setResetPassword(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Reset Password</h2>
            <p className="text-slate-500 mb-6">Set new password for <span className="font-semibold text-slate-800">{resettingUser}</span></p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-2"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};