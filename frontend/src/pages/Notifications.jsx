import { useEffect, useState } from 'react';
import { FiBell, FiCheck, FiSettings } from 'react-icons/fi';
import { notificationService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    taskAssigned: true,
    commentMention: true,
    projectInvitation: true,
    taskDeadline: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, prefRes] = await Promise.all([
        notificationService.getNotifications().catch(() => []),
        notificationService.getPreferences().catch(() => null),
      ]);

      const list = notifRes.data?.content || notifRes.data || notifRes || [];
      setNotifications(list);

      if (prefRes?.data || prefRes) {
        setPreferences(prefRes.data || prefRes);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Marked as read');
    } catch (err) {}
  };

  const handleTogglePref = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await notificationService.updatePreferences(preferences);
      toast.success('Notification preferences updated!');
    } catch (err) {
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Stay informed on task assignments, mentions, and project updates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FiBell className="text-blue-600 w-5 h-5" />
              <h3 className="font-bold text-slate-800 text-base">Your Notifications</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notifications to display.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-3.5 px-2 flex items-start justify-between gap-3 text-xs ${
                    !n.isRead ? 'bg-blue-50/50 font-medium rounded-lg' : ''
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-slate-800 mb-0.5">{n.title || 'Notification'}</h5>
                    <p className="text-slate-700 leading-snug">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="px-2 py-1 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"
                    >
                      <FiCheck className="w-3 h-3" /> Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Preferences Control */}
        <Card className="space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FiSettings className="text-blue-600 w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Preferences</h3>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { key: 'commentMention', label: 'Comment & Mention Alerts' },
              { key: 'taskAssigned', label: 'Task Assignment Alerts' },
              { key: 'projectInvitation', label: 'Project Invites' },
              { key: 'taskDeadline', label: 'Overdue Task Reminders' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-slate-700">{item.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(preferences[item.key])}
                  onChange={() => handleTogglePref(item.key)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
              </label>
            ))}
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={savingPrefs}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs disabled:opacity-50 mt-2"
          >
            {savingPrefs ? 'Saving...' : 'Save Preferences'}
          </button>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
