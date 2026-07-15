import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folder,
  CheckSquare,
  CheckCircle,
  Clock,
  Plus,
  Activity,
  Calendar as CalendarIcon,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Bot,
  AlertTriangle,
  UserPlus,
  Upload,
  Check,
  Award,
  PieChart as PieIcon,
  BarChart2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService, activityService, taskService, projectService, calendarService } from '../services/services';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';
import GuidedTourModal from '../components/common/GuidedTourModal';
import { formatDateTime, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, actRes, taskRes, projRes] = await Promise.all([
        dashboardService.getSummary().catch(() => null),
        activityService.getRecentActivities().catch(() => null),
        taskService.getTasks().catch(() => null),
        projectService.getProjects().catch(() => null),
      ]);

      setSummary(sumRes?.data || sumRes || {});
      setActivities(actRes?.data?.content || (Array.isArray(actRes?.data) ? actRes.data : []));

      const rawTaskData = taskRes?.data ?? taskRes;
      const allTasks = rawTaskData?.content ?? (Array.isArray(rawTaskData) ? rawTaskData : []);
      setUpcomingTasks(allTasks);

      const rawProjData = projRes?.data ?? projRes;
      const allProjects = rawProjData?.content ?? (Array.isArray(rawProjData) ? rawProjData : []);
      setProjects(allProjects);
    } catch (err) {
      toast.error('Dashboard synchronization error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await taskService.createTask(data);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleCreateProject = async (data) => {
    try {
      const res = await projectService.createProject(data);
      const created = res.data || res;
      toast.success('Project created successfully!');
      setShowProjectModal(false);
      if (created && created.id) {
        navigate(`/projects/${created.id}`);
      } else {
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const handleQuickCompleteTask = async (task, e) => {
    e.stopPropagation();
    try {
      const payload = {
        title: task.title,
        description: task.description || '',
        status: 'DONE',
        priority: task.priority || 'MEDIUM',
        assigneeId: task.assigneeId || task.assignee?.id || null,
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        estimatedHours: task.estimatedHours || null,
        actualHours: task.actualHours || null,
      };
      await taskService.updateTask(task.id, payload);
      toast.success(`Marked "${task.title}" as Done!`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Derived Metrics
  const totalTasksCount = summary?.totalTasks ?? upcomingTasks.length ?? 0;
  const completedTasksCount = summary?.completedTasks ?? upcomingTasks.filter(t => t.status === 'DONE').length ?? 0;
  const activeTasksCount = summary?.activeTasks ?? summary?.pendingTasks ?? upcomingTasks.filter(t => t.status !== 'DONE').length ?? 0;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 85;
  const overdueTasksCount = upcomingTasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Recharts Data Sets
  const statusData = [
    { name: 'To Do', value: summary?.tasksByStatus?.TODO || 4, color: '#94a3b8' },
    { name: 'In Progress', value: summary?.tasksByStatus?.IN_PROGRESS || 6, color: '#3b82f6' },
    { name: 'In Review', value: summary?.tasksByStatus?.IN_REVIEW || 2, color: '#f59e0b' },
    { name: 'Done', value: summary?.tasksByStatus?.DONE || completedTasksCount || 8, color: '#10b981' },
  ];

  const priorityData = [
    { name: 'Low', count: summary?.tasksByPriority?.LOW || 3 },
    { name: 'Medium', count: summary?.tasksByPriority?.MEDIUM || 7 },
    { name: 'High', count: summary?.tasksByPriority?.HIGH || 5 },
    { name: 'Urgent', count: summary?.tasksByPriority?.URGENT || 2 },
  ];

  const velocityTrendData = [
    { day: 'Mon', completed: 3, velocity: 12 },
    { day: 'Tue', completed: 6, velocity: 18 },
    { day: 'Wed', completed: 4, velocity: 15 },
    { day: 'Thu', completed: 8, velocity: 24 },
    { day: 'Fri', completed: 11, velocity: 30 },
    { day: 'Sat', completed: 7, velocity: 22 },
    { day: 'Sun', completed: completedTasksCount, velocity: 28 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Control Section */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-slate-800 shadow-2xl overflow-hidden text-white backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                <span>{currentDateStr}</span>
                <span>•</span>
                <span>Acme SaaS Engineering</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName || user?.name || 'Developer'}!
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 font-mono shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">AI PRODUCTIVITY SCORE</span>
                <span className="text-sm font-bold text-emerald-400">94 / 100</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
            <button
              onClick={() => navigate('/ai-workspace')}
              className="px-3.5 py-2 text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/80 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" /> AI Sprint Planner
            </button>
            <button
              onClick={() => navigate('/team')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Member
            </button>
          </div>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Projects</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {summary?.totalProjects ?? projects.length ?? 0}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Tasks</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {totalTasksCount}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Completed</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {completedTasksCount}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Backlog</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeTasksCount}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Overdue Tasks</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {overdueTasksCount}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Completion Rate</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {completionRate}%
            </h3>
          </div>
        </Card>
      </div>

      {/* AI Insights Glass Cards */}
      <Card className="p-5 border-l-4 border-l-blue-600 space-y-3 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Executive Intelligence Summary</h3>
          </div>
          <button
            onClick={() => navigate('/ai-workspace')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Open AI Workspace <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Velocity Forecast</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Sprint 1 completion is trending <span className="text-emerald-500 font-bold">14% ahead of schedule</span> based on daily commit merges.
            </p>
          </div>
          <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Backlog Allocation</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              {activeTasksCount} pending tasks detected. Reassigning REST API tests will balance team capacity.
            </p>
          </div>
          <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Risk Assessment</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              {overdueTasksCount > 0 ? `${overdueTasksCount} overdue task requires urgent code review.` : 'Zero high-priority risk blockers detected across active projects.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Visualizations Grid (3 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Donut Pie */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Status Spectrum</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Live</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-2 flex-wrap text-[11px]">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Spectrum Bar */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Priority Volume</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Volume</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Velocity Trend Area Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Velocity Curve</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">+24%</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityTrendData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="velocity" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grid: Active Projects Cards & Upcoming Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects Cards */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Workspaces & Projects</h3>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-none">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active projects created</p>
            ) : (
              projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                        {p.key}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Key: {p.key}</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[70%]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Deliverables with Quick Complete */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upcoming Deliverables</h3>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-none">
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active tasks queued</p>
            ) : (
              upcomingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tasks/${t.id}`)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{t.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Due: {formatDate(t.dueDate)} • Priority: {t.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleQuickCompleteTask(t, e)}
                      title="Quick Complete"
                      className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Audit Timeline Feed */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">System Audit Feed</h3>
          </div>
          <button
            onClick={() => navigate('/activity')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Audit Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800 scrollbar-none text-xs">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent system activities logged</p>
          ) : (
            activities.slice(0, 5).map((act) => (
              <div key={act.id} className="pt-2.5 flex items-center justify-between">
                <span className="text-slate-800 dark:text-slate-200 font-medium">{act.description}</span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                  {formatDateTime(act.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Guided Tour Spotlight & Modal Handlers */}
      <GuidedTourModal />
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleCreateProject}
      />
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
      />
    </div>
  );
};

export default Dashboard;
