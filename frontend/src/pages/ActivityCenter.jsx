import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Filter, Search, Clock, Folder, CheckSquare, MessageSquare, UserPlus } from 'lucide-react';
import { activityService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const ActivityCenter = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activityService.getRecentActivities();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      setActivities(list);
    } catch (err) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const safeActivities = Array.isArray(activities) ? activities : [];
  const filteredActivities = safeActivities.filter((act) => {
    if (!act) return false;
    const desc = (act.description || '').toLowerCase();
    const q = (search || '').toLowerCase();
    const matchesSearch = desc.includes(q);
    
    if (categoryFilter === 'PROJECTS') return matchesSearch && desc.includes('project');
    if (categoryFilter === 'TASKS') return matchesSearch && desc.includes('task');
    if (categoryFilter === 'COMMENTS') return matchesSearch && desc.includes('comment');
    return matchesSearch;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <ActivityIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> System Activity Audit Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time timeline tracking all project updates, task transitions, comment discussions, and member security actions
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter timeline activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Filter className="text-slate-400 w-4 h-4" />
          {[
            { key: 'ALL', label: 'All Feeds' },
            { key: 'PROJECTS', label: 'Projects' },
            { key: 'TASKS', label: 'Tasks' },
            { key: 'COMMENTS', label: 'Comments' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                categoryFilter === cat.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      <Card>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No audit records matching specified timeline criteria
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {filteredActivities.map((act) => {
              const desc = act.description || 'System action logged';
              let Icon = ActivityIcon;
              let color = 'bg-blue-500';

              if (desc.includes('project')) {
                Icon = Folder;
                color = 'bg-indigo-500';
              } else if (desc.includes('task')) {
                Icon = CheckSquare;
                color = 'bg-blue-500';
              } else if (desc.includes('comment')) {
                Icon = MessageSquare;
                color = 'bg-amber-500';
              }

              return (
                <div key={act.id} className="relative group">
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ${color} ring-4 ring-white dark:ring-slate-900 shadow-xs flex items-center justify-center text-white`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 group-hover:border-blue-500/40 transition-colors">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{desc}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityCenter;
