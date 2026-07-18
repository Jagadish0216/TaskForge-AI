import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Archive,
  Cpu,
  MessageSquare,
  Paperclip,
  Activity,
  AlertTriangle,
  HardDrive,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        setStats(response.data || response);
      } catch (err) {
        toast.error('Failed to load system statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Format Storage
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
    { label: 'Active Users', value: stats?.activeUsers, icon: Users, color: 'text-emerald-500' },
    { label: 'Total Projects', value: stats?.totalProjects, icon: FolderKanban, color: 'text-indigo-500' },
    { label: 'Archived Projects', value: stats?.archivedProjects, icon: Archive, color: 'text-amber-500' },
    { label: 'Active Projects', value: stats?.activeProjects, icon: FolderKanban, color: 'text-teal-500' },
    { label: 'AI Projects', value: stats?.aiGeneratedProjects, icon: Cpu, color: 'text-purple-500' },
    { label: 'Completed Tasks', value: stats?.completedTasks, icon: CheckSquare, color: 'text-green-500' },
    { label: 'Pending Tasks', value: stats?.pendingTasks, icon: Clock, color: 'text-yellow-500' },
    { label: 'Overdue Tasks', value: stats?.overdueTasks, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Discussion Messages', value: stats?.discussionMessages, icon: MessageSquare, color: 'text-sky-500' },
    { label: 'Comments', value: stats?.comments || 0, icon: MessageSquare, color: 'text-violet-500' },
    { label: 'Attachments Count', value: stats?.attachments, icon: Paperclip, color: 'text-cyan-500' },
    { label: 'Storage Usage', value: formatBytes(stats?.storageUsage), icon: HardDrive, color: 'text-pink-500' },
  ];

  // Pie chart data for Task Statuses
  const taskStatusData = stats?.tasksByStatus
    ? Object.keys(stats.tasksByStatus).map((key) => ({
        name: key,
        value: stats.tasksByStatus[key],
      }))
    : [];

  // Bar chart data for Project Priorities
  const projectPriorityData = stats?.projectsByPriority
    ? Object.keys(stats.projectsByPriority).map((key) => ({
        name: key,
        value: stats.projectsByPriority[key],
      }))
    : [];

  // Mock trend data for dashboard
  const trendData = [
    { name: 'Feb', users: 2, projects: 1, tasks: 4 },
    { name: 'Mar', users: 5, projects: 3, tasks: 12 },
    { name: 'Apr', users: 8, projects: 6, tasks: 21 },
    { name: 'May', users: 15, projects: 10, tasks: 35 },
    { name: 'Jun', users: 24, projects: 18, tasks: 58 },
    { name: 'Jul', users: stats?.totalUsers || 28, projects: stats?.totalProjects || 22, tasks: stats?.totalTasks || 75 },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</span>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{c.value ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" /> System Growth & Activity
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Legend />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Registered Users" />
                <Area type="monotone" dataKey="projects" stroke="#10b981" fillOpacity={1} fill="url(#colorProjects)" name="Projects Created" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Tasks by Status</h2>
          <div className="h-72 flex flex-col justify-between">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData.length > 0 ? taskStatusData : [{ name: 'No Tasks', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs">
              {taskStatusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-400 font-medium">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" /> Recent Administrative Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{log.description}</td>
                    <td className="py-3.5 px-4 text-slate-400">{log.userEmail}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No recent activities recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
