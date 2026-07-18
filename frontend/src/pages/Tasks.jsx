import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, List, Grid, CheckSquare, UserCheck, AlertCircle, CalendarClock, ToggleLeft, ToggleRight } from 'lucide-react';
import { taskService, projectService } from '../services/services';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/tasks/TaskCard';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export const Tasks = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'

  // Sub-tabs for "My Tasks"
  const [subTab, setSubTab] = useState('ASSIGNED_TO_ME');
  const [showAllTasks, setShowAllTasks] = useState(false);

  const [modalState, setModalState] = useState({ open: false, task: null });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [taskRes, projRes] = await Promise.all([
        taskService.getTasks().catch(() => null),
        projectService.getProjects().catch(() => null),
      ]);

      const rawTaskData = taskRes?.data ?? taskRes;
      const tList = rawTaskData?.content ?? (Array.isArray(rawTaskData) ? rawTaskData : []);
      setTasks(Array.isArray(tList) ? tList : []);

      const rawProjData = projRes?.data ?? projRes;
      const pList = rawProjData?.content ?? (Array.isArray(rawProjData) ? rawProjData : []);
      setProjects(Array.isArray(pList) ? pList : []);
    } catch (err) {
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (modalState.task) {
        await taskService.updateTask(modalState.task.id, data);
        toast.success('Task updated successfully');
      } else {
        await taskService.createTask(data);
        toast.success('Task created successfully');
      }
      setModalState({ open: false, task: null });
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;
      const payload = {
        title: taskToUpdate.title,
        description: taskToUpdate.description || '',
        status: newStatus,
        priority: taskToUpdate.priority || 'MEDIUM',
        assigneeId: taskToUpdate.assigneeId || taskToUpdate.assignee?.id || null,
        startDate: taskToUpdate.startDate || null,
        dueDate: taskToUpdate.dueDate || null,
        estimatedHours: taskToUpdate.estimatedHours || null,
        actualHours: taskToUpdate.actualHours || null,
      };
      await taskService.updateTask(taskId, payload);
      toast.success('Task status updated');
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted');
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const isPMOrAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_PROJECT_MANAGER' || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_PROJECT_MANAGER');

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Base list of user assigned tasks for counting
  const userTasks = safeTasks.filter((t) => t.assignee?.id === user?.id);

  // Compute counts for user tasks
  const counts = {
    ASSIGNED_TO_ME: userTasks.length,
    PENDING: userTasks.filter((t) => t.status !== 'DONE').length,
    COMPLETED: userTasks.filter((t) => t.status === 'DONE').length,
    OVERDUE: userTasks.filter((t) => t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr).length,
    DUE_TODAY: userTasks.filter((t) => t.status !== 'DONE' && t.dueDate && t.dueDate === todayStr).length,
  };

  // Base list of tasks to display
  const baseTasks = showAllTasks ? safeTasks : userTasks;

  // Filter by active subTab
  const activeTasks = baseTasks.filter((t) => {
    if (showAllTasks) return true; // sub-tabs only make sense for "My Tasks"
    if (subTab === 'PENDING') return t.status !== 'DONE';
    if (subTab === 'COMPLETED') return t.status === 'DONE';
    if (subTab === 'OVERDUE') return t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr;
    if (subTab === 'DUE_TODAY') return t.status !== 'DONE' && t.dueDate && t.dueDate === todayStr;
    return true; // ASSIGNED_TO_ME
  });

  const filteredTasks = activeTasks.filter((t) => {
    if (!t) return false;
    const title = (t.title || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const q = (search || '').toLowerCase();
    const matchesSearch = title.includes(q) || desc.includes(q);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Task Workflow Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, assign, and organize tasks across all active projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle All Tasks (only for Admin/PM) */}
          {isPMOrAdmin && (
            <button
              onClick={() => {
                setShowAllTasks(!showAllTasks);
                // Clear active subTab when viewing all tasks
                if (!showAllTasks) setSubTab('ASSIGNED_TO_ME');
              }}
              className="text-xs font-semibold px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {showAllTasks ? (
                <>
                  <ToggleRight className="w-5 h-5 text-blue-600" /> Showing All Tasks
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" /> Show My Tasks Only
                </>
              )}
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-655 dark:text-slate-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-655 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <button
            onClick={() => setModalState({ open: true, task: null })}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Sub-Tabs for "My Tasks" (Only shown when not showing all tasks) */}
      {!showAllTasks && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { key: 'ASSIGNED_TO_ME', label: 'Assigned To Me', icon: UserCheck, badge: counts.ASSIGNED_TO_ME },
            { key: 'PENDING', label: 'Pending', icon: AlertCircle, badge: counts.PENDING },
            { key: 'COMPLETED', label: 'Completed', icon: CheckSquare, badge: counts.COMPLETED },
            { key: 'OVERDUE', label: 'Overdue', icon: AlertCircle, badge: counts.OVERDUE, badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
            { key: 'DUE_TODAY', label: 'Due Today', icon: CalendarClock, badge: counts.DUE_TODAY, badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSubTab(tab.key)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  active
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="text-slate-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Display */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="No tasks match the active filters or assigned sub-tab."
          action={
            <button
              onClick={() => setModalState({ open: true, task: null })}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Create Task
            </button>
          }
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onEditTask={(t) => setModalState({ open: true, task: t })}
          onDeleteTask={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => setModalState({ open: true, task: t })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, task: null })}
        onSubmit={handleCreateOrUpdate}
        task={modalState.task}
        projects={projects}
      />
    </div>
  );
};

export default Tasks;
