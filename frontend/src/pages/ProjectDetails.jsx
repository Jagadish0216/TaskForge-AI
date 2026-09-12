import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folder,
  CheckSquare,
  Users,
  Cpu,
  Plus,
  Trash2,
  UserPlus,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Activity,
  Sparkles,
  Paperclip,
  Upload,
  Download,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Check,
} from 'lucide-react';
import { projectService, taskService, aiService, attachmentService, activityService } from '../services/services';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskCard from '../components/tasks/TaskCard';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailsDrawer from '../components/tasks/TaskDetailsDrawer';
import InviteMemberModal from '../components/projects/InviteMemberModal';
import { getInitials, formatDate, formatDateTime, getAvatarUrl } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview'); // overview, board, list, timeline, calendar, files, activity, ai

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [aiPrompt, setAiPrompt] = useState('Generate sprint tasks for user login, authentication, and dashboard metrics.');
  const [aiOutput, setAiOutput] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, memRes, attRes, actRes] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getTasks({ projectId: Number(id) }).catch(() => []),
        projectService.getMembers(id).catch(() => []),
        attachmentService.getAttachmentsByProject(id).catch(() => []),
        activityService.getProjectTimeline(id).catch(() => []),
      ]);

      setProject(projRes.data || projRes);
      setTasks(taskRes.data?.content || (Array.isArray(taskRes.data) ? taskRes.data : []));
      setMembers(memRes.data?.content || (Array.isArray(memRes.data) ? memRes.data : []));
      setAttachments(attRes.data || (Array.isArray(attRes) ? attRes : []));
      setActivities(actRes.data?.content || (Array.isArray(actRes.data) ? actRes.data : []));
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data) => {
    await taskService.createTask({ ...data, projectId: Number(id) });
    toast.success('Task created successfully!');
    fetchProjectData();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const previousStatus = taskToUpdate.status;

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

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

    try {
      await taskService.updateTask(taskId, payload);
      toast.success(`Moved task to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
      );
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update task status';
      toast.error(errorMessage);
    }
  };

  const handleInviteMember = async (data) => {
    try {
      const res = await projectService.inviteMember(id, data);
      const invitee = res.data?.invitee || res.invitee || {};
      const name = `${invitee.firstName || ''} ${invitee.lastName || ''}`.trim() || data.email;
      toast.success(`${name} has been added to the project.`);
      fetchProjectData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }
    try {
      await projectService.removeMember(id, memberId);
      toast.success(`${memberName} has been removed from the project.`);
      fetchProjectData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', id);

    try {
      await attachmentService.uploadAttachment(formData);
      toast.success('Project attachment uploaded successfully!');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAttachment = async (attId, filename) => {
    try {
      const res = await attachmentService.downloadAttachmentFile(attId);
      const blob = res instanceof Blob ? res : new Blob([res]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'attachment.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloading ${filename}...`);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleGenerateAiSprint = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    try {
      const res = await aiService.planSprint(id, aiPrompt);
      const resData = res.data || res;
      setAiOutput(resData.generatedContent || resData);
      toast.success('AI Sprint generated!');
    } catch (err) {
      toast.error('AI Generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  const canManageMembers = () => {
    if (!user) return false;
    const isGlobalAdmin = user.role === 'ROLE_ADMIN' || user.roles?.includes('ROLE_ADMIN');
    const isGlobalPM = user.role === 'ROLE_PROJECT_MANAGER' || user.roles?.includes('ROLE_PROJECT_MANAGER');
    if (isGlobalAdmin || isGlobalPM) return true;

    if (project && (project.owner?.id === user.id || project.ownerId === user.id)) {
      return true;
    }

    const currentMemberRecord = members.find(m => (m.user?.id === user.id || m.userId === user.id));
    if (currentMemberRecord && (currentMemberRecord.role === 'OWNER' || currentMemberRecord.role === 'MANAGER')) {
      return true;
    }

    return false;
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!project) return null;

  // Real Telemetry Calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const overdueTasks = tasks.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date());
  const overdueTasksCount = overdueTasks.length;

  // Upcoming priority work sorted by Overdue first, then Urgent/High, then Due Date
  const upcomingDeliverables = [...tasks]
    .filter((t) => t.status !== 'DONE')
    .sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 1 : 0;
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    })
    .slice(0, 4);

  // Avatar Stack Configuration
  const maxVisibleAvatars = 4;
  const visibleMembers = members.slice(0, maxVisibleAvatars);
  const overflowMemberCount = Math.max(0, members.length - maxVisibleAvatars);

  return (
    <div className="space-y-6 font-sans pb-8">
      {/* 1. Low-Profile Engineering Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                {project.projectKey || project.key}
              </span>
              <Badge type="projectStatus" value={project.status || 'IN_PROGRESS'} />
              <Badge type="priority" value={project.priority || 'MEDIUM'} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {project.name}
            </h1>
          </div>
        </div>

        {/* Header Right Controls: Team Avatar Stack + Primary Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end shrink-0">
          {/* Team Avatar Stack */}
          {members.length > 0 && (
            <div className="flex items-center -space-x-2 overflow-hidden py-1 pr-1" title="Project Team Members">
              {visibleMembers.map((m) => {
                const u = m.user || m;
                const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                return u.avatarUrl ? (
                  <img
                    key={m.id}
                    src={getAvatarUrl(u.avatarUrl)}
                    alt={name}
                    title={`${name} (${m.role || 'MEMBER'})`}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover shrink-0"
                  />
                ) : (
                  <div
                    key={m.id}
                    title={`${name} (${m.role || 'MEMBER'})`}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] uppercase shrink-0"
                  >
                    {getInitials(name)}
                  </div>
                );
              })}
              {overflowMemberCount > 0 && (
                <div
                  title={`${overflowMemberCount} more team members`}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0"
                >
                  +{overflowMemberCount}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canManageMembers() && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Member
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowTaskModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Task
            </button>
          </div>
        </div>
      </div>

      {/* 3. Streamlined Workspace Tabs Navigation (Preserves All 8 Tabs) */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
        {[
          { key: 'overview', label: 'Overview', icon: Folder },
          { key: 'board', label: 'Kanban Board', icon: CheckSquare },
          { key: 'list', label: `List View (${tasks.length})`, icon: FileText },
          { key: 'timeline', label: 'Timeline', icon: Clock },
          { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
          { key: 'files', label: `Files (${attachments.length})`, icon: Paperclip },
          { key: 'activity', label: 'Audit Activity', icon: Activity },
          { key: 'ai', label: 'AI Insights Co-Pilot', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4. Real Project Telemetry Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
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
                  <span className="text-[10px] text-slate-400 font-mono">({completedTasksCount}/{totalTasksCount})</span>
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
                  <span className="text-[10px] text-slate-400 font-mono">tasks queued</span>
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
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Team Members
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {members.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">assigned</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Overview Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Scope Description & Upcoming Deliverables */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Scope Description */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                    Project Scope & Description
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Created: {formatDate(project.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.description || 'No detailed project scope description provided.'}
                </p>
              </div>

              {/* 6. Upcoming Priority Deliverables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Upcoming Priority Deliverables
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('board')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open Kanban Board <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {upcomingDeliverables.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400">No active deliverables queued</p>
                    </div>
                  ) : (
                    upcomingDeliverables.map((t) => {
                      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isOverdue
                              ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10 hover:border-rose-500/50'
                              : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-blue-500/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge type="priority" value={t.priority} />
                              <Badge type="status" value={t.status} />
                              {isOverdue && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-mono">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {t.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Due: {t.dueDate ? formatDate(t.dueDate) : 'No deadline set'}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Team Roster & AI Summary */}
            <div className="space-y-6">
              {/* 8. Team Roster Panel */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                      Project Team Roster ({members.length})
                    </h3>
                  </div>
                  {canManageMembers() && (
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      + Add
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {members.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No team members assigned</p>
                  ) : (
                    members.map((m) => {
                      const u = m.user || m;
                      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 p-2 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {u.avatarUrl ? (
                              <img
                                src={getAvatarUrl(u.avatarUrl)}
                                alt={name}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                                {getInitials(name)}
                              </div>
                            )}
                            <div className="text-left truncate">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate leading-tight">
                                {name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[9px] font-mono font-bold rounded">
                              {m.role || 'MEMBER'}
                            </span>
                            {canManageMembers() && m.role !== 'OWNER' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id, name)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                                title="Remove Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI Workspace Quick Insight */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 dark:bg-cyan-950/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      AI Project Health Summary
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Open Co-Pilot
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Project is at <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completionRate}% completion</span> with {activeTasksCount} active backlog tasks and {overdueTasksCount} overdue risk factors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOARD */}
      {activeTab === 'board' && (
        <KanbanBoard tasks={tasks} onTaskClick={(t) => setSelectedTaskId(t.id)} onStatusChange={handleStatusChange} />
      )}

      {/* TAB 3: LIST VIEW */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8 col-span-full">No active tasks created in project</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} onClick={() => setSelectedTaskId(t.id)} className="cursor-pointer">
                <TaskCard task={t} />
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Phased Milestone Schedule</h3>
          <div className="space-y-3 font-mono text-xs">
            {tasks.map((t, idx) => (
              <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t.title}</span>
                  <span className="text-[10px] text-slate-400 block">Due: {formatDate(t.dueDate)}</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-semibold text-[10px]">
                  Phase {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: CALENDAR */}
      {activeTab === 'calendar' && (
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Deliverable Schedule Grid</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {tasks.map((t) => (
              <div key={t.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{t.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Due: {formatDate(t.dueDate)}</span>
                </div>
                <Badge type="priority" value={t.priority} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: FILES */}
      {activeTab === 'files' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Project Attachment Assets</h3>
            <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload File Asset'}
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-2">
            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No attachments uploaded to project</p>
            ) : (
              attachments.map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{att.fileName || att.filename}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{att.fileType || 'Project asset'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(att.id, att.fileName || att.filename)}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-semibold rounded-lg hover:bg-blue-100 flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 7: AUDIT ACTIVITY */}
      {activeTab === 'activity' && (
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Project Audit Timeline</h3>
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No project audit records found</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="pt-2.5 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{act.description}</span>
                  <span className="text-[10px] font-mono text-slate-400">{formatDateTime(act.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 8: AI INSIGHTS */}
      {activeTab === 'ai' && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-600 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">AI Sprint & Capacity Co-Pilot</h3>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <button
              onClick={handleGenerateAiSprint}
              disabled={generatingAi}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {generatingAi ? 'Generating Sprint Plan...' : 'Generate AI Sprint Plan'}
            </button>
          </div>

          {aiOutput && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {typeof aiOutput === 'string' ? aiOutput : JSON.stringify(aiOutput, null, 2)}
            </div>
          )}
        </Card>
      )}

      {/* Modals & Inspectors */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchProjectData}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        projects={[project]}
      />
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        excludeUserIds={members.map((m) => m.user?.id || m.userId || m.id).filter(Boolean)}
      />
    </div>
  );
};

export default ProjectDetails;
