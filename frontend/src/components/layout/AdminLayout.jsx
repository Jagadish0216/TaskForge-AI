import { useState, useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import { Menu, Shield, Settings, User, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('users')) return 'User Management';
    if (path.includes('projects')) return 'Project Operations';
    if (path.includes('tasks')) return 'Global Task Audit';
    if (path.includes('teams')) return 'Team Directory';
    if (path.includes('reports')) return 'Reports Generator';
    if (path.includes('analytics')) return 'System Analytics';
    if (path.includes('audit-logs')) return 'Security Audit Trail';
    if (path.includes('system-settings')) return 'System Settings';
    if (path.includes('announcements')) return 'System Announcements';
    if (path.includes('ai-usage')) return 'AI Engine Usage';
    if (path.includes('profile')) return 'Admin Profile';
    return 'Admin Dashboard';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased dark">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/system-settings')}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="System Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-slate-800" />
            
            {/* User Dropdown / Summary */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">{user?.name || 'Admin User'}</p>
                <span className="text-[10px] text-slate-400">System Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} TaskForge Enterprise Administration Portal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
