import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  Layers,
  Search,
  Users,
  Activity,
  Star,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workspace', path: '/ai-workspace', icon: Sparkles, badge: 'PRO' },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks & Board', path: '/tasks', icon: CheckSquare },
    { name: 'Team Workspace', path: '/team', icon: Users },
    { name: 'Activity Audit', path: '/activity', icon: Activity },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Global Search', path: '/search', icon: Search },
    { name: 'Profile Settings', path: '/profile', icon: User },
    { name: 'Platform Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Header Switcher */}
        <div className="p-4 border-b border-slate-800/80">
          <WorkspaceSwitcher />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.badge ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Pinned Projects Shortcuts Section */}
          <div className="pt-4">
            <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <span>Pinned Favorites</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <div className="space-y-1 px-1">
              <NavLink
                to="/projects"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="truncate">Sprint Engine Alpha</span>
              </NavLink>
              <NavLink
                to="/projects"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate">Core REST APIs</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer Signout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
