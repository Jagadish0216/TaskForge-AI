import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Settings, Layers, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkspaceSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWs, setActiveWs] = useState({ id: 1, name: 'Acme SaaS Engineering', role: 'Owner' });
  const navigate = useNavigate();

  const workspaces = [
    { id: 1, name: 'Acme SaaS Engineering', role: 'Owner', badge: 'Active' },
    { id: 2, name: 'TaskForge Open Source', role: 'Admin', badge: 'Shared' },
    { id: 3, name: 'Personal Projects', role: 'Owner', badge: 'Personal' },
  ];

  const handleSelectWorkspace = (ws) => {
    setActiveWs(ws);
    setIsOpen(false);
    toast.success(`Switched workspace to ${ws.name}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg text-white font-bold text-xs shrink-0 shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-left truncate">
            <h4 className="font-bold text-white text-xs truncate leading-tight">{activeWs.name}</h4>
            <span className="text-[10px] text-blue-400 font-mono block leading-tight">{activeWs.role}</span>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Workspaces ({workspaces.length})
            </div>

            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => handleSelectWorkspace(ws)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                  activeWs.id === ws.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="font-bold truncate">{ws.name}</div>
                  <span className={`text-[10px] ${activeWs.id === ws.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {ws.role} • {ws.badge}
                  </span>
                </div>
                {activeWs.id === ws.id && <Check className="w-4 h-4 shrink-0" />}
              </div>
            ))}

            <div className="pt-1 border-t border-slate-800 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/workspace');
                }}
                className="flex items-center gap-2 w-full px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-blue-400" />
                <span>Workspace Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  toast.success('Multi-workspace creator modal initialized');
                }}
                className="flex items-center gap-2 w-full px-2.5 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-950/40 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
