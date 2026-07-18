import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { Loader2, Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({
    appName: 'TaskForge AI',
    logoUrl: '',
    theme: 'dark',
    defaultLanguage: 'en',
    notificationSettings: 'true',
    maintenanceMode: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        setSettings(prev => ({ ...prev, ...(res.data || res || {}) }));
      } catch (err) {
        toast.error('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('System settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950">
        <Settings className="h-5 w-5 text-blue-500" />
        <h2 className="font-bold text-white text-base">Application Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">Application Name</label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">Logo Image URL</label>
          <input
            type="text"
            value={settings.logoUrl}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Default Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-850">
          <div>
            <span className="text-xs font-semibold text-white block">Email Notifications</span>
            <span className="text-[10px] text-slate-500">Enable default system-wide email triggers.</span>
          </div>
          <select
            value={settings.notificationSettings}
            onChange={(e) => setSettings({ ...settings, notificationSettings: e.target.value })}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded px-2.5 py-1 focus:outline-none"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-850">
          <div>
            <span className="text-xs font-semibold text-white block">Maintenance Mode</span>
            <span className="text-[10px] text-slate-500">Lock application access to administrators only.</span>
          </div>
          <select
            value={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.value })}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded px-2.5 py-1 focus:outline-none"
          >
            <option value="false">Off / Active</option>
            <option value="true">On / Locked</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSystemSettings;
