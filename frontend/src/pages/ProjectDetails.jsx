import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
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
import { getInitials, formatDate, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      fetchProjectData();
    } catch (err) {}
  };

  const handleInviteMember = async (data) => {
    await projectService.inviteMember(id, data);
    toast.success('Member invitation sent!');
    fetchProjectData();
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
      const res = await aiService.generateSprint(aiPrompt);
      const resData = res.data || res;
      setAiOutput(resData.generatedContent || resData);
      toast.success('AI Sprint generated!');
    } catch (err) {
      toast.error('AI Generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
              <Folder className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                  {project.projectKey || project.key}
                </span>
                <Badge type="projectStatus" value={project.status || 'IN_PROGRESS'} />
                <Badge type="priority" value={project.priority || 'MEDIUM'} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        </div>

        {/* 8 Workspace Tabs Navigation */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 overflow-x-auto scrollbar-none">
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
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Project Scope Description</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {project.description || 'No detailed project description provided.'}
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Workspace Metadata</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Project Key:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{project.projectKey || project.key}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Visibility Flag:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{project.visibility || 'PUBLIC'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created Timestamp:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BOARD */}
      {activeTab === 'board' && (
        <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
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
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200">
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
      />
    </div>
  );
};

export default ProjectDetails;
