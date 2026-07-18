import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiCalendar,
  FiClock,
  FiUser,
  FiPaperclip,
  FiUpload,
  FiTrash2,
  FiDownload,
  FiArrowLeft,
  FiActivity,
  FiBriefcase,
  FiEdit2,
} from 'react-icons/fi';
import { taskService, attachmentService, commentService, projectService, activityService } from '../services/services';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentSection from '../components/comments/CommentSection';
import UserAutocomplete from '../components/common/UserAutocomplete';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime, getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, aRes, actRes] = await Promise.all([
        taskService.getTaskById(id).catch(() => null),
        commentService.searchComments({ taskId: Number(id) }).catch(() => null),
        attachmentService.getAttachmentsByTask(id).catch(() => null),
        activityService.searchActivities({ taskId: Number(id) }).catch(() => null),
      ]);
      const loadedTask = tRes?.data || tRes;
      if (!loadedTask) {
        toast.error('Failed to load task details');
        navigate('/tasks');
        return;
      }
      setTask(loadedTask);
      setComments(cRes?.data?.content || (Array.isArray(cRes?.data) ? cRes.data : []));
      setAttachments(aRes?.data || (Array.isArray(aRes) ? aRes : []));
      setActivities(actRes?.data?.content || (Array.isArray(actRes?.data) ? actRes.data : []));

      const pId = loadedTask.projectId || loadedTask.project?.id;
      if (pId) {
        const memRes = await projectService.getMembers(pId).catch(() => null);
        setMembers(memRes?.data?.content || memRes?.data || memRes || []);
      }
    } catch (err) {
      toast.error('Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', id);
    if (task?.projectId || task?.project?.id) {
      formData.append('projectId', task.projectId || task.project.id);
    }

    try {
      await attachmentService.uploadAttachment(formData);
      toast.success('File attached successfully!');
      fetchTask();
    } catch (err) {
      toast.error('File upload failed');
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

  const handleDeleteAttachment = async (attId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await attachmentService.deleteAttachment(attId);
      toast.success('Attachment deleted');
      fetchTask();
    } catch (err) {}
  };

  const handleReassign = async (u) => {
    if (!task) return;
    try {
      const payload = {
        title: task.title,
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        assigneeId: u ? u.id : null,
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        estimatedHours: task.estimatedHours || null,
        actualHours: task.actualHours || null,
      };
      await taskService.updateTask(task.id, payload);
      toast.success('Task reassigned successfully!');
      setIsReassigning(false);
      fetchTask();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign task');
    }
  };

  const canReassign = () => {
    if (!user) return false;
    const isGlobalAdmin = user.role === 'ROLE_ADMIN' || user.roles?.includes('ROLE_ADMIN');
    const isGlobalPM = user.role === 'ROLE_PROJECT_MANAGER' || user.roles?.includes('ROLE_PROJECT_MANAGER');
    if (isGlobalAdmin || isGlobalPM) return true;

    const project = task?.project;
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
  if (!task) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back to tasks link */}
      <div>
        <button
          onClick={() => navigate('/tasks')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Tasks List
        </button>
      </div>

      {/* Task Header & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Content: Title, Description, Comments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                TASK #{task.id}
              </span>
              <span className="text-[10px] text-slate-400">
                Created: {formatDateTime(task.createdAt)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
              {task.title}
            </h1>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">
                Task Description & Requirements
              </h3>
              <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No detailed description provided for this task.'}
              </p>
            </div>
          </Card>

          {/* Comment Section Component */}
          <CommentSection
            taskId={task.id}
            comments={comments}
            onRefresh={fetchTask}
          />
        </div>

        {/* Specifications Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Task Specifications
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Status */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Status</span>
                <Badge type="status" value={task.status} />
              </div>

              {/* Priority */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Priority</span>
                <Badge type="priority" value={task.priority} />
              </div>

              {/* Project Phase */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Project Phase</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <FiActivity className="w-3.5 h-3.5 text-blue-500" />
                  {task.project?.phase || 'N/A'}
                </span>
              </div>

              {/* Deadline (Due Date) */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Deadline</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-amber-500" />
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                </span>
              </div>

              {/* Assigned To */}
              <div className="py-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Assigned To</span>
                  {canReassign() && !isReassigning && (
                    <button
                      onClick={() => setIsReassigning(true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <FiEdit2 className="w-2.5 h-2.5" /> Reassign
                    </button>
                  )}
                </div>

                {isReassigning ? (
                  <div className="mt-1 space-y-2">
                    <UserAutocomplete
                      selectedUser={task.assignee}
                      onSelect={handleReassign}
                      onRemove={() => handleReassign(null)}
                      onlyProjectMembers={true}
                      members={members}
                      placeholder="Select new assignee..."
                    />
                    <button
                      onClick={() => setIsReassigning(false)}
                      className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : task.assignee ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                      {getInitials(`${task.assignee.firstName} ${task.assignee.lastName}`)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-none mt-0.5">
                        {task.assignee.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-450 italic">Unassigned</span>
                )}
              </div>

              {/* Assigned By */}
              <div className="py-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Assigned By</span>
                {task.assignedBy ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      {getInitials(`${task.assignedBy.firstName} ${task.assignedBy.lastName}`)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                        {task.assignedBy.firstName} {task.assignedBy.lastName}
                      </span>
                      {task.assignedDate && (
                        <span className="text-[10px] text-slate-405 block leading-none mt-0.5 font-mono">
                          on {formatDateTime(task.assignedDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-450 italic">System Auto-created</span>
                )}
              </div>

              {/* Effort Estimate */}
              {task.estimatedHours && (
                <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Estimated Effort</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-purple-500" />
                    {task.estimatedHours} hours
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Attachments Section */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiPaperclip className="text-blue-600 w-4 h-4" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Attachments</h3>
              </div>

              <label className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1">
                <FiUpload className="w-3 h-3" />
                <span>{uploading ? '...' : 'Add'}</span>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {!attachments || attachments.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-3 text-center">No file attachments linked.</p>
              ) : (
                attachments.map((att) => (
                  <div key={att.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FiPaperclip className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={att.fileName}>{att.fileName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => handleDownloadAttachment(att.id, att.fileName)}
                        className="p-1 text-slate-455 hover:text-blue-600 rounded"
                        title="Download file"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="p-1 text-slate-455 hover:text-red-655 rounded"
                        title="Delete file"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Activity Logs & History Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Task History & Reassignments
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-3 text-center">No activity history logs recorded.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-805 rounded-xl text-[11px] space-y-1">
                    <p className="text-slate-800 dark:text-slate-200 leading-normal">{act.description}</p>
                    <span className="text-[9px] font-mono text-slate-400 block text-right">{formatDateTime(act.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
