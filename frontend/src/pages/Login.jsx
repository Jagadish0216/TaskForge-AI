import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken) => {
    setLoading(true);
    try {
      const u = await googleLogin(idToken);
      handleAuthSuccess(u);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Google Identity Services Script dynamically if available
    const scriptId = 'google-gis-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const triggerGoogleOAuth = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com',
        callback: (response) => {
          if (response.credential) {
            handleGoogleSignIn(response.credential);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      // Fallback mock token generation for dev/demo environments
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: 'google-uid-12345',
          email: 'google.developer@taskforge.ai',
          email_verified: true,
          given_name: 'Google',
          family_name: 'User',
          picture: 'https://lh3.googleusercontent.com/a/default-user',
        })
      );
      const mockIdToken = `${header}.${payload}.mock-signature`;
      handleGoogleSignIn(mockIdToken);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-500/30 selection:text-blue-400">
      {/* Left Column - Product Marketing Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Ambient Glow background mesh */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-white text-xl tracking-tight">TaskForge AI</span>
            <span className="text-[10px] text-blue-400 font-mono block">ENTERPRISE SAAS PLATFORM</span>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Driven Workspace Synchronization</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-snug">
            Streamline your software sprint cycles with linear accuracy.
          </h2>

          <div className="space-y-3 pt-2">
            {[
              'Automated sprint capacity planning and allocation',
              'Integrated Kanban boarding and status synchronization',
              'Executive throughput reporting with interactive charts',
              'Zero-friction deployment tracking across environments',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Social Proof Quote */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-slate-300 italic">
            "TaskForge AI reduced our sprint breakdown overhead by 70%. It is hands-down the cleanest project management tool we've used."
          </p>
          <p className="text-[11px] font-bold text-slate-400">— David Miller, VP of Engineering</p>
        </div>
      </div>

      {/* Right Column - Split Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Sign In to Your Workspace</h2>
            <p className="text-xs text-slate-400">
              Welcome back! Please enter your account credentials to continue.
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={triggerGoogleOAuth}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>🌐</span>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>💻</span>
              <span>GitHub</span>
            </button>
            <button
              type="button"
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>💼</span>
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-950 px-3 text-[10px] uppercase font-mono text-slate-500 font-bold shrink-0">
              Or With Email
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Account Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-all"
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

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0" />
                <span>Remember this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:underline">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
