import { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { userService } from '../../services/services';
import { getAvatarUrl, getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const UserAutocomplete = ({
  selectedUser = null,
  onSelect,
  onRemove,
  placeholder = "Search user by name, username or email...",
  disabled = false,
  excludeUserIds = [],
  onlyProjectMembers = false,
  members = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    if (onlyProjectMembers) {
      // Local filter of project members
      const query = val.toLowerCase();
      const filtered = members
        .map(m => m.user || m)
        .filter(u => {
          if (excludeUserIds.includes(u.id)) return false;
          const firstName = (u.firstName || '').toLowerCase();
          const lastName = (u.lastName || '').toLowerCase();
          const name = `${firstName} ${lastName}`.trim();
          const username = (u.username || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          return name.includes(query) || username.includes(query) || email.includes(query);
        });
      setSearchResults(filtered);
    } else {
      // API search for all TaskForge users
      setSearching(true);
      try {
        const res = await userService.searchUsers({ keyword: val.trim() });
        const content = res.data?.content || res.content || [];
        // Filter out excluded user IDs and duplicates
        const filtered = content.filter(u => !excludeUserIds.includes(u.id));
        setSearchResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }
  };

  const handleSelect = (u) => {
    onSelect(u);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative w-full">
      {selectedUser ? (
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            {selectedUser.avatarUrl ? (
              <img
                src={getAvatarUrl(selectedUser.avatarUrl)}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] uppercase">
                {getInitials(`${selectedUser.firstName} ${selectedUser.lastName}`)}
              </div>
            )}
            <div className="text-left">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
              <span className="text-[10px] text-slate-400 block">{selectedUser.email}</span>
            </div>
          </div>
          {!disabled && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              disabled={disabled}
              placeholder={disabled ? "Access Restricted" : placeholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-600 animate-spin" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
                >
                  {u.avatarUrl ? (
                    <img
                      src={getAvatarUrl(u.avatarUrl)}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] uppercase">
                      {getInitials(`${u.firstName} ${u.lastName}`)}
                    </div>
                  )}
                  <div className="text-left">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {u.firstName} {u.lastName} ({u.username || u.email.split('@')[0]})
                    </span>
                    <span className="text-[10px] text-slate-450 block">{u.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAutocomplete;
