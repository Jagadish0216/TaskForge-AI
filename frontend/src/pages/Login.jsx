import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (u) => {
    const roles = u?.roles || (u?.role ? [u.role] : []);
    if (roles.includes('ROLE_ADMIN')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      handleAuthSuccess(u);
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Left Column - Engineering Clarity Product Shell */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900/50 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/80">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
            <Layers className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-white text-xl tracking-tight">TaskForge</span>
            <span className="text-[10px] text-cyan-400 font-mono block">ENGINEERING CLARITY PLATFORM</span>
          </div>
        </div>

        {/* Product Positioning */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Role-Based Engineering Workspace</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
            Streamlined project operations with AI-assisted sprint planning.
          </h2>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <p className="leading-relaxed">
              TaskForge unites interactive Kanban boards, role-based access control, real-time analytics, and AI Mission Control into one cohesive workspace.
            </p>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
              Quick Demo Login Shortcuts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoPreset('manager@demo.taskforge.local', 'demo123')}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all group"
              >
                <div className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Project Manager
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">manager@demo...</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPreset('member@demo.taskforge.local', 'demo123')}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all group"
              >
                <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Team Member
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">member@demo...</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPreset('admin@demo.taskforge.local', 'demo123')}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all group"
              >
                <div className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">admin@demo...</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-slate-500 font-mono">
          TaskForge Engineering Platform • Portfolio Demonstration
        </div>
      </div>

      {/* Right Column - Clean Credentials Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to TaskForge</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {/* Quick Demo Credentials Helper for Small Screens */}
          <div className="lg:hidden p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              Demo Account Presets
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoPreset('manager@demo.taskforge.local', 'demo123')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px] font-medium"
              >
                Project Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('member@demo.taskforge.local', 'demo123')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[11px] font-medium"
              >
                Team Member
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('admin@demo.taskforge.local', 'demo123')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded text-[11px] font-medium"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Trigger */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
