import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import UserAutocomplete from '../common/UserAutocomplete';
import { MEMBER_ROLES } from '../../utils/constants';

export const InviteMemberModal = ({ isOpen, onClose, onInvite, excludeUserIds = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUser(null);
      setRole('MEMBER');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      await onInvite({ email: selectedUser.email, role });
      setSelectedUser(null);
      setRole('MEMBER');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Search User *
          </label>
          <UserAutocomplete
            selectedUser={selectedUser}
            onSelect={(u) => setSelectedUser(u)}
            onRemove={() => setSelectedUser(null)}
            excludeUserIds={excludeUserIds}
            placeholder="Search by name, username or email..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {MEMBER_ROLES.filter((r) => r.value !== 'OWNER').map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedUser}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {loading ? 'Adding Member...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
