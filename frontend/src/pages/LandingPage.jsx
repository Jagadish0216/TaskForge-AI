import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
  Users,
  Sun,
  Moon,
  Monitor,
  Star,
  ChevronRight,
  Activity,
  Calendar,
  Code2,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-400 overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-lg tracking-tight">TaskForge AI</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                v2.5
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Enterprise</a>
          </nav>

          {/* Action Triggers */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleThemeMode}
              title={`Theme: ${theme}`}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Monitor className="w-4 h-4 text-blue-400" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
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
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                >
                  Get Started <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Next-Gen Enterprise AI Sprint Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
              Read 2.5 Architecture <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Project Intelligence Engineered for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              High-Velocity Software Teams
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            TaskForge AI merges linear task workflows, automated dependency resolution, and enterprise velocity metrics into a single unified workspace.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch Free Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Architecture</span>
            </a>
          </div>
        </motion.div>

        {/* Product Mockup Preview Box */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 relative max-w-5xl mx-auto p-3 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-800 shadow-2xl shadow-blue-950/50 backdrop-blur-xl"
        >
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 overflow-hidden text-left border border-slate-800/80 space-y-6">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-500 ml-2">app.taskforge.ai/workspace/sprint-alpha</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SYSTEM ONLINE
                </span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Sprint Velocity</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">94.8%</div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[94%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Active Epics</span>
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">12 Projects</div>
                <p className="text-[10px] text-emerald-400">↑ 3 new epics created this week</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Open Backlog Issues</span>
                  <CheckSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">48 Tasks</div>
                <p className="text-[10px] text-slate-500">14 awaiting peer code review</p>
              </div>
            </div>

            {/* Mock Kanban Row Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'AI Backlog Priority Optimization', key: 'TF-104', status: 'IN PROGRESS', priority: 'URGENT', color: 'border-blue-500/40 bg-blue-950/20' },
                { title: 'Spring Boot 3 REST DTO Validation', key: 'TF-108', status: 'IN REVIEW', priority: 'HIGH', color: 'border-amber-500/40 bg-amber-950/20' },
                { title: 'Recharts Responsive Analytics Suite', key: 'TF-112', status: 'DONE', priority: 'MEDIUM', color: 'border-emerald-500/40 bg-emerald-950/20' },
              ].map((item) => (
                <div key={item.key} className={`p-3.5 rounded-xl border ${item.color} space-y-2`}>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 font-bold">{item.key}</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-200">{item.status}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900 relative z-10">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Architectural Pillars</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Built for Uncompromising Precision</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Everything your team needs to plan, track, and ship software with zero operational friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: 'AI Sprint Allocation',
              desc: 'Automatically evaluate developer throughput and assign complex task backlogs using intelligent scheduling models.',
            },
            {
              icon: FolderKanban,
              title: 'Dynamic Kanban Boards',
              desc: 'Seamlessly transition tasks between status columns with status synchronization and quick filters.',
            },
            {
              icon: BarChart3,
              title: 'Velocity Analytics',
              desc: 'Real-time throughput metrics, historical completion trends, and team productivity visualization using Recharts.',
            },
            {
              icon: ShieldCheck,
              title: 'Role Security & Control',
              desc: 'Granular access controls separating Owner, Manager, Member, and Viewer project permissions.',
            },
            {
              icon: Zap,
              title: 'Instant Global Search',
              desc: 'Query across thousands of tasks, comments, files, and project records instantly with zero latency.',
            },
            {
              icon: Calendar,
              title: 'Milestone Timelines',
              desc: 'Calendar schedule grid tracking upcoming deliverables, hard deadlines, and system audit logs.',
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Banner */}
      <section id="metrics" className="py-16 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">99.9%</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-mono">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">10x</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-mono">Faster Sprint Planning</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">50k+</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-mono">Tasks Managed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">&lt; 50ms</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-mono">API Response Time</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Engineering Leadership</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Trusted by Modern Product Teams</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'TaskForge AI completely removed sprint planning chaos. The AI backlog allocator saved our team 6 hours every Monday.',
              author: 'Sarah Lin',
              role: 'VP of Engineering, CloudCore',
            },
            {
              quote: 'The speed and visual polish match tools like Linear, but with the full control of our custom Spring Boot stack.',
              author: 'Marcus Vance',
              role: 'Lead Architect, DevPulse SaaS',
            },
            {
              quote: 'Switching to TaskForge gave our engineers a clean dark workspace that actually speeds up daily task updates.',
              author: 'Elena Rostova',
              role: 'Head of Product, NextStack Systems',
            },
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              <div>
                <h4 className="text-xs font-bold text-white">{t.author}</h4>
                <p className="text-[11px] text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 space-y-6 relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to Upgrade Your Engineering Workflow?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of developers using TaskForge AI for fast, beautiful, and intelligence-driven project delivery.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 font-bold text-sm rounded-2xl shadow-xl hover:bg-slate-100 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">TaskForge AI</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#features" className="hover:text-slate-300">Terms of Service</a>
            <a href="#features" className="hover:text-slate-300">Security Specs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
