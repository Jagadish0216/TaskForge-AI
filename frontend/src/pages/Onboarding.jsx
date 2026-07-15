import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Rocket,
  Code,
  Cpu,
  Zap,
  Folder,
  Users,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Onboarding Form State
  const [workspaceName, setWorkspaceName] = useState('Acme SaaS Engineering');
  const [workspaceDesc, setWorkspaceDesc] = useState('High-velocity core engineering squad');
  const [selectedIcon, setSelectedIcon] = useState('Rocket');
  const [template, setTemplate] = useState('Software Development');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Lead');
  const [timezone, setTimezone] = useState('UTC-5 (EST)');

  const icons = [
    { name: 'Rocket', icon: Rocket },
    { name: 'Code', icon: Code },
    { name: 'Cpu', icon: Cpu },
    { name: 'Layers', icon: Layers },
    { name: 'Zap', icon: Zap },
    { name: 'Folder', icon: Folder },
  ];

  const templates = [
    { title: 'Software Development', desc: 'Standard Kanban board, Sprint Backlog & Code reviews' },
    { title: 'Student Capstone', desc: 'Milestone tracking, team assignments & report summaries' },
    { title: 'Startup MVP', desc: 'High velocity issue backlog with priority tracking' },
    { title: 'Research & Product', desc: 'Structured milestones and documentation links' },
  ];

  const handleAddInvite = () => {
    if (inviteEmail.trim()) {
      setInvitedMembers([...invitedMembers, inviteEmail.trim()]);
      setInviteEmail('');
      toast.success('Invitation queued!');
    }
  };

  const handleNext = () => {
    if (step < 8) setStep(step + 1);
    else {
      toast.success('Workspace configured successfully!');
      navigate('/dashboard?tour=true');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Progress Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white text-base">TaskForge AI Onboarding</span>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400">
          Step {step} of 8
        </div>
      </div>

      {/* Main Step Cards */}
      <div className="max-w-xl mx-auto w-full my-auto py-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl"
          >
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to TaskForge AI</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Let's configure your new engineering workspace in less than 60 seconds. We'll set up your theme, project defaults, and team invitations.
                </p>
              </div>
            )}

            {/* Step 2: Choose Theme */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Choose Preferred Interface Theme</h2>
                  <p className="text-xs text-slate-400">Select how TaskForge AI appears on your devices.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ].map((t) => {
                    const Icon = t.icon;
                    const active = theme === t.key;
                    return (
                      <div
                        key={t.key}
                        onClick={() => setTheme(t.key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all text-center space-y-2 ${
                          active
                            ? 'border-blue-500 bg-blue-500/10 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto" />
                        <span className="text-xs font-bold block">{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Workspace Setup */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Configure Workspace Profile</h2>
                  <p className="text-xs text-slate-400">Name your primary development team or organization.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Workspace Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={workspaceDesc}
                      onChange={(e) => setWorkspaceDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Workspace Icon */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Select Workspace Icon</h2>
                  <p className="text-xs text-slate-400">Choose an emblem mark for your workspace sidebar.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {icons.map((item) => {
                    const Icon = item.icon;
                    const active = selectedIcon === item.name;
                    return (
                      <div
                        key={item.name}
                        onClick={() => setSelectedIcon(item.name)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all text-center ${
                          active
                            ? 'border-blue-500 bg-blue-500/10 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto" />
                        <span className="text-[11px] font-semibold block mt-2">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Default Project Template */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Choose Default Project Template</h2>
                  <p className="text-xs text-slate-400">Pre-configure your issue statuses and priority defaults.</p>
                </div>
                <div className="space-y-2 pt-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.title}
                      onClick={() => setTemplate(tpl.title)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        template === tpl.title
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{tpl.title}</h4>
                        <p className="text-[11px] text-slate-400">{tpl.desc}</p>
                      </div>
                      {template === tpl.title && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Invite Team Members */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Invite Team Collaborators</h2>
                  <p className="text-xs text-slate-400">Add team emails to send workspace access tokens.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddInvite}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {invitedMembers.map((m, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-300">
                      <span>{m}</span>
                      <span className="text-[10px] text-blue-400 font-mono">Invited</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Profile Setup */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white">Personalize Profile Setup</h2>
                  <p className="text-xs text-slate-400">Help teammates identify your engineering role.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option>UTC-5 (EST)</option>
                      <option>UTC-8 (PST)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+5:30 (IST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Completion Screen */}
            {step === 8 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Workspace is Ready!</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Everything is configured for <span className="font-semibold text-white">{workspaceName}</span>. Proceed to your executive dashboard to launch your first sprint.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>{step === 8 ? 'Launch Workspace Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full text-center text-[11px] text-slate-500 font-mono z-10">
        TaskForge AI 2.5 • Unified SaaS Workflows
      </div>
    </div>
  );
};

export default Onboarding;
