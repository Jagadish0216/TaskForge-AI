import { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Sun, Moon, Monitor, Bell, Shield, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    commentMention: true,
    projectInvitation: true,
    taskDeadline: true,
  });

  const handleTogglePreference = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success('Preference updated');
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Platform Preferences & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize UI aesthetics, dark/light theme persistence, and event notifications
        </p>
      </div>

      {/* Theme Controls */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Appearance & Interface Theme</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { key: 'light', title: 'Light Theme', desc: 'Clean high contrast daytime mode', icon: Sun },
            { key: 'dark', title: 'Dark Theme', desc: 'Sleek dark navy night mode', icon: Moon },
            { key: 'system', title: 'System Dynamic', desc: 'Follows operating system preset', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const active = theme === item.key;
            return (
              <div
                key={item.key}
                onClick={() => {
                  setTheme(item.key);
                  toast.success(`Theme switched to ${item.title}`);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  active
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {active && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Event Notifications Preferences */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Notification Frequency & Triggers</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {[
            { key: 'taskAssigned', title: 'Task Assignment Alerts', desc: 'Notify me whenever a new task is assigned to my account' },
            { key: 'commentMention', title: 'Comment Discussions & Mentions', desc: 'Alert me on discussions or @mentions in task threads' },
            { key: 'projectInvitation', title: 'Project Team Invitations', desc: 'Notify me when I am invited to join a workspace project' },
            { key: 'taskDeadline', title: 'Upcoming Deadline Reminders', desc: 'Send daily summary of tasks due within 24 hours' },
          ].map((pref) => (
            <div key={pref.key} className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{pref.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleTogglePreference(pref.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications[pref.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications[pref.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
