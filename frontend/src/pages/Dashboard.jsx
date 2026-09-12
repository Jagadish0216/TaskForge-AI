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
  Sparkles,
  ArrowRight,
  Zap,
  AlertTriangle,
  UserPlus,
  Check,
  PieChart as PieIcon,
  BarChart2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService, activityService, taskService, projectService, announcementService } from '../services/services';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
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
  const [announcements, setAnnouncements] = useState([]);
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
      const [sumRes, actRes, taskRes, projRes, annRes] = await Promise.all([
        dashboardService.getSummary().catch(() => null),
        activityService.getRecentActivities().catch(() => null),
        taskService.getTasks().catch(() => null),
        projectService.getProjects().catch(() => null),
        announcementService.getActiveAnnouncements().catch(() => null),
      ]);

      setSummary(sumRes?.data || sumRes || {});
      setActivities(actRes?.data?.content || (Array.isArray(actRes?.data) ? actRes.data : []));

      const rawTaskData = taskRes?.data ?? taskRes;
      const allTasks = rawTaskData?.content ?? (Array.isArray(rawTaskData) ? rawTaskData : []);
      setUpcomingTasks(allTasks);

      const rawProjData = projRes?.data ?? projRes;
      const allProjects = rawProjData?.content ?? (Array.isArray(rawProjData) ? rawProjData : []);
      setProjects(allProjects);

      setAnnouncements(annRes?.data || annRes || []);
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

  // Real Derived Metrics
  const totalProjectsCount = summary?.totalProjects ?? projects.length ?? 0;
  const totalTasksCount = summary?.totalTasks ?? upcomingTasks.length ?? 0;
  const completedTasksCount = summary?.completedTasks ?? upcomingTasks.filter((t) => t.status === 'DONE').length ?? 0;
  const activeTasksCount = summary?.activeTasks ?? summary?.pendingTasks ?? upcomingTasks.filter((t) => t.status !== 'DONE').length ?? 0;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const overdueTasks = upcomingTasks.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date());
  const overdueTasksCount = overdueTasks.length;

  // Active Work Filter (Overdue first, then High/Urgent, then In Progress)
  const activeWorkTasks = [...upcomingTasks]
    .filter((t) => t.status !== 'DONE')
    .sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 1 : 0;
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    })
    .slice(0, 5);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Recharts Data Sets (Using Real Backend Metrics)
  const statusData = [
    { name: 'To Do', value: summary?.tasksByStatus?.TODO || 0, color: '#94a3b8' },
    { name: 'In Progress', value: summary?.tasksByStatus?.IN_PROGRESS || 0, color: '#3b82f6' },
    { name: 'In Review', value: summary?.tasksByStatus?.IN_REVIEW || 0, color: '#f59e0b' },
    { name: 'Done', value: summary?.tasksByStatus?.DONE || completedTasksCount || 0, color: '#10b981' },
  ];

  const priorityData = [
    { name: 'Low', count: summary?.tasksByPriority?.LOW || 0 },
    { name: 'Medium', count: summary?.tasksByPriority?.MEDIUM || 0 },
    { name: 'High', count: summary?.tasksByPriority?.HIGH || 0 },
    { name: 'Urgent', count: summary?.tasksByPriority?.URGENT || 0 },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="visible"
      animate="visible"
      className="space-y-6 font-sans pb-8"
    >
      {/* System Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 backdrop-blur-md flex items-start gap-3 shadow-xs"
            >
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white leading-tight">{ann.title}</h4>
                <p className="text-[11px] text-slate-300 leading-normal">{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Low-Profile Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              Workspace Overview
            </span>
            <span>•</span>
            <span>{currentDateStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Engine Command Center
            <span className="text-xs font-mono font-normal px-2 py-0.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20">
              {user?.firstName || user?.name || 'Developer'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
          <button
            type="button"
            onClick={() => navigate('/ai-workspace')}
            className="px-3.5 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> AI Workspace
          </button>
        </div>
      </div>

      {/* 2. Streamlined KPI Metric Strip (High-Density Ribbon) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Total Projects
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {totalProjectsCount}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">active scope</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Active Backlog
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {activeTasksCount}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/ {totalTasksCount} total</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          overdueTasksCount > 0
            ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20'
            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50'
        }`}>
          <div className={`p-2 rounded-lg ${
            overdueTasksCount > 0
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {overdueTasksCount > 0 ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Overdue Blockers
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-extrabold ${
                overdueTasksCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {overdueTasksCount}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {overdueTasksCount > 0 ? 'requires action' : 'clean timeline'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Completion Rate
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {completionRate}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{completedTasksCount} done</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Command Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Active Work & Project Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work / Priority Feed */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Priority Tasks Requiring Attention
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeWorkTasks.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Zero active tasks queued in workspace</p>
                </div>
              ) : (
                activeWorkTasks.map((t) => {
                  const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                  return (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/tasks`)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isOverdue
                          ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10 hover:border-rose-500/50'
                          : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge type="priority" value={t.priority} />
                          <Badge type="status" value={t.status} />
                          {isOverdue && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-mono">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Due: {t.dueDate ? formatDate(t.dueDate) : 'No deadline'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleQuickCompleteTask(t, e)}
                          title="Quick Mark Done"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Project Health Matrix */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Project Health Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                All Projects ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {projects.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">No projects registered</p>
                </div>
              ) : (
                projects.slice(0, 5).map((p) => {
                  const tot = p.totalTasks || 0;
                  const comp = p.completedTasks || 0;
                  const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-blue-500/40 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded shrink-0">
                            {p.projectKey || p.key || 'PROJ'}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {p.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-slate-400">
                          <Badge type="projectStatus" value={p.status || 'PLANNING'} />
                          <span>{comp}/{tot} ({pct}%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: AI Intelligence, Charts, & Activity Feed */}
        <div className="space-y-6">
          {/* 3. Restrained AI Intelligence Center */}
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 dark:bg-cyan-950/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-tight">
                  Workspace Intelligence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ai-workspace')}
                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Launch AI <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                  Completion Status
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  Completion rate is <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completionRate}%</span> across all recorded tasks.
                </p>
              </div>

              <div className="p-2.5 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                  Risk & Blockers
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  {overdueTasksCount > 0
                    ? `${overdueTasksCount} overdue task(s) require urgent attention.`
                    : 'Zero overdue task blockers in active tasks.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status Donut & Priority Spectrum */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Status Donut */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Status Distribution</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Live</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 flex-wrap text-[10px] mt-1">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Priority Bar Chart */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Priority Volume</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Real Data</span>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/activity')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Activity Log <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-none text-xs">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No recent activities logged</p>
                ) : (
                  activities.slice(0, 4).map((act) => (
                    <div key={act.id} className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-tight">
                        {act.description}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Guided Tour & Modal Handlers */}
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
    </motion.div>
  );
};

export default Dashboard;
