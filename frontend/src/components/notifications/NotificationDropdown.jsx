import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiArrowRight } from 'react-icons/fi';
import { notificationService } from '../../services/services';
import { formatDateTime } from '../../utils/formatters';

export const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data?.content || res.data || res || [];
      setNotifications(list.slice(0, 5));
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FiBell className="text-blue-600 w-4 h-4" />
          <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
        </div>
        <button
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          View all <FiArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <p className="p-4 text-xs text-center text-slate-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No unread notifications
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${
                !item.isRead ? 'bg-blue-50/40 font-medium' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-slate-800 leading-snug">{item.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                {!item.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                    title="Mark as read"
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
