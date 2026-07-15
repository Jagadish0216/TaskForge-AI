import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Shield, Check, Edit3 } from 'lucide-react';
import { userService } from '../services/services';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({ firstName, lastName });
      toast.success('Profile updated successfully!');
      refreshUser();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage personal credentials, display details, and identity roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card className="flex flex-col items-center text-center p-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
            {getInitials(user.name || user.email)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{user.name || 'User Name'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800 uppercase tracking-wider font-mono">
            {user.role || 'ROLE_TEAM_MEMBER'}
          </span>
        </Card>

        {/* Update Profile Form */}
        <Card className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Edit Details</h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read Only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
