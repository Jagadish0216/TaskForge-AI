import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  Bell,
  User,
  Settings,
  Plus,
  Users,
  Activity,
  Layers,
  Sun,
  Moon,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const commandItems = [
    // Quick Navigation
    { title: 'Go to Executive Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { title: 'Go to Projects Directory', category: 'Navigation', icon: FolderKanban, action: () => navigate('/projects') },
    { title: 'Go to Tasks & Kanban Board', category: 'Navigation', icon: CheckSquare, action: () => navigate('/tasks') },
    { title: 'Go to Team Management', category: 'Navigation', icon: Users, action: () => navigate('/team') },
    { title: 'Go to Workspace Settings', category: 'Navigation', icon: Layers, action: () => navigate('/workspace') },
    { title: 'Go to Activity Audit Center', category: 'Navigation', icon: Activity, action: () => navigate('/activity') },
    { title: 'Go to Milestone Calendar', category: 'Navigation', icon: Calendar, action: () => navigate('/calendar') },
    { title: 'Go to Velocity Reports', category: 'Navigation', icon: BarChart3, action: () => navigate('/reports') },
    { title: 'Go to Profile Settings', category: 'Navigation', icon: User, action: () => navigate('/profile') },

    // Quick Actions
    { title: 'Create New Task', category: 'Actions', icon: Plus, action: () => navigate('/tasks') },
    { title: 'Create New Project', category: 'Actions', icon: Plus, action: () => navigate('/projects') },
    { title: 'Invite Team Member', category: 'Actions', icon: Users, action: () => navigate('/team') },
    { title: 'Switch Theme (Dark / Light)', category: 'Actions', icon: theme === 'dark' ? Sun : Moon, action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        toast.success(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'}`);
      }
    },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Command Palette Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search workspace..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownList}
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-none">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No commands matching "{query}"
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const active = selectedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                      active
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold ${active ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {item.category}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↑↓</kbd> Navigate</span>
              <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↵</kbd> Select</span>
              <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">esc</kbd> Dismiss</span>
            </div>
            <span>TaskForge AI Command OS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
