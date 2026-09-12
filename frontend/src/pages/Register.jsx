import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setLoading(true);
    try {
      await register(firstName, lastName, email, password, 'ROLE_TEAM_MEMBER');
      navigate('/dashboard');
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Left Column - Product Branding Shell */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900/50 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/80">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
            <Layers className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-white text-xl tracking-tight">TaskForge</span>
            <span className="text-[10px] text-cyan-400 font-mono block">ENGINEERING CLARITY PLATFORM</span>
          </div>
        </div>

        {/* Product Highlights */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Developer Account Creation</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
            Join your team's high-clarity software engineering workspace.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Create your account to manage sprint backlogs, track task progress, collaborate on code reviews, and leverage AI Mission Control.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-500 font-mono">
          TaskForge Engineering Platform • Portfolio Demonstration
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
            <p className="text-xs text-slate-400">
              Set up your details to get started with TaskForge.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Morgan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {passwordError && (
                <p className="text-[11px] text-red-400 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
