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
  Search,
  Users,
  Activity,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const workspaceNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workspace', path: '/ai-workspace', icon: Bot, isAi: true },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks & Board', path: '/tasks', icon: CheckSquare },
    { name: 'Team Workspace', path: '/team', icon: Users },
    { name: 'Activity Audit', path: '/activity', icon: Activity },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const accountNavItems = [
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
        <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-none">
          {/* Workspace Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Workspace
            </div>
            <div className="space-y-0.5">
              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                        isActive
                          ? item.isAi
                            ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/80'
                            : 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? item.isAi ? 'text-cyan-400' : 'text-white'
                                : item.isAi
                                ? 'text-cyan-400/80'
                                : 'text-slate-400 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isAi ? 'bg-cyan-400' : 'bg-white'}`} />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Account Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Account & Tools
            </div>
            <div className="space-y-0.5">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer Signout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/30 cursor-pointer"
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
