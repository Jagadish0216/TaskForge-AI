import { useState } from 'react';
import { Layers, HardDrive, Shield, Globe, Users, Save, Check, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

export const Workspace = () => {
  const [name, setName] = useState('Acme SaaS Engineering');
  const [description, setDescription] = useState('High-velocity core software development squad');
  const [urlSlug, setUrlSlug] = useState('acme-engineering');
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Workspace parameters saved successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Workspace Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage workspace identity, organization quotas, storage usage, and regional policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Quota Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Storage & Quotas</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Attachment Cloud Storage</span>
                <span className="font-mono">1.2 GB / 10 GB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full w-[12%]" />
              </div>
            </div>

            <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Active Projects</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">12 / Unlimited</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Backlog Tasks</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">48 Tasks</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Active Seats</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">4 Members</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Workspace Identity Settings */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Organization Profile</h3>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              ENTERPRISE TIER
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workspace URL Handle
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-slate-500 font-mono">
                  app.taskforge.ai/w/
                </span>
                <input
                  type="text"
                  required
                  value={urlSlug}
                  onChange={(e) => setUrlSlug(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-r-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Workspace Parameters'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Workspace;
