import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/formatters';
import NotificationDropdown from '../notifications/NotificationDropdown';

export const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleThemeMode = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-30 glass-panel bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        {/* Left: Mobile Toggle & Global Quick Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={onOpenSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 rounded-xl md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workspace (tasks, projects, team)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
            />
            <span className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleThemeMode}
            title={`Current Theme: ${theme.toUpperCase()}`}
            className="p-2.5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Monitor className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* User Profile Pill */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-1 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {getInitials(user?.name || user?.email)}
            </div>
            <div className="hidden sm:block text-left pr-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'User Profile'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
