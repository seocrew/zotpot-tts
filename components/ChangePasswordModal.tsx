import React, { useState } from 'react';
import { X, Key, AlertCircle, Check } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, username, onChangePassword }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    const result = onChangePassword(oldPassword, newPassword);
    
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } else {
      setError("Incorrect current password");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-scaleIn m-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600 mb-3">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500 mt-1">Update password for <span className="font-semibold text-slate-700">{username}</span></p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-green-600 animate-scaleIn">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <p className="font-bold text-lg">Password Changed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                required
              />
            </div>
            
            <div className="border-t border-slate-100 my-2"></div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 mt-2 active:scale-[0.98]"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};