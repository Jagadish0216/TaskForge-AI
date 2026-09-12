import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Kanban,
  CheckCircle2,
  Brain,
  ListTodo,
  Users,
  Sun,
  Moon,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleThemeMode = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 overflow-x-hidden">
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight">TaskForge</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                AI Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#ai-mission-control" className="hover:text-white transition-colors">AI Mission Control</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          {/* Action Triggers */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleThemeMode}
              title={`Theme: ${theme}`}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Monitor className="w-4 h-4 text-blue-400" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                Open Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  Explore Demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          {/* Main Positioning */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>TaskForge Engineering Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineering clarity for <br />
            <span className="text-cyan-400">modern software teams.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            TaskForge unites interactive Kanban boards, role-based security, telemetry dashboards, and structured AI sprint planning into one unified platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>View Features</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Primary Differentiators Feature Grid */}
      <section id="features" className="relative z-10 py-16 px-6 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Core Capabilities
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Built for software engineering rigor
          </h2>
          <p className="text-xs text-slate-400">
            Real features designed to provide visibility and control across your development workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit border border-cyan-500/20">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Kanban Workflow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag-and-drop task movement across Backlog, To Do, In Progress, In Review, and Done with optimistic state updates and REST API persistence.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl w-fit border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Role-Based Access Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fine-grained security enforcing distinct capabilities for System Administrators, Project Managers, and Team Members.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit border border-purple-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dashboards & Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aggregated project metrics, sprint completion progress, priority distribution, and recent activity audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* AI Mission Control Section */}
      <section id="ai-mission-control" className="relative z-10 py-16 px-6 max-w-6xl mx-auto border-t border-slate-900">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold">
              <Brain className="w-3.5 h-3.5" />
              <span>AI Mission Control</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              AI recommendations that become real backlog tasks.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              TaskForge AI goes beyond chat bubbles. It analyzes project telemetry to generate structured risk assessments and sprint recommendations that you can review and commit directly into your project Backlog.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Risk Radar</h4>
                  <p className="text-[11px] text-slate-400">Structured severity levels, affected tasks, and actionable mitigations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Structured Sprint Planning</h4>
                  <p className="text-[11px] text-slate-400">Generates selectable task cards with priority, hours, and reasoning.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">One-Click Backlog Persistence</h4>
                  <p className="text-[11px] text-slate-400">Selected AI suggestions are converted into real BACKLOG tasks on Kanban.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Google Gemini Integration</h4>
                  <p className="text-[11px] text-slate-400">Backend API pipeline with automatic model fallback handling.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>Try AI Mission Control</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TaskForge</span>
            <span>• Engineering Clarity Platform</span>
          </div>
          <div>Portfolio Demonstration Platform</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
