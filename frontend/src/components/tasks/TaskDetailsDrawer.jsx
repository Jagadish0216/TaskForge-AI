import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  User,
  Folder,
  MessageSquare,
  Paperclip,
  Sparkles,
  Upload,
  Download,
  Trash2,
  Send,
  History,
  AlertTriangle,
  Calendar,
  Edit2,
} from 'lucide-react';
import { taskService, commentService, attachmentService, projectService, activityService } from '../../services/services';
import Badge from '../common/Badge';
import { formatDate, formatDateTime, getInitials } from '../../utils/formatters';
import UserAutocomplete from '../common/UserAutocomplete';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const TaskDetailsDrawer = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('COMMENTS'); // COMMENTS, ATTACHMENTS, HISTORY
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (taskId && isOpen) {
      setIsReassigning(false);
      fetchTaskData();
    }
  }, [taskId, isOpen]);

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, aRes, actRes] = await Promise.all([
        taskService.getTaskById(taskId).catch(() => null),
        commentService.searchComments({ taskId }).catch(() => null),
        attachmentService.getAttachmentsByTask(taskId).catch(() => null),
        activityService.searchActivities({ taskId: Number(taskId) }).catch(() => null),
      ]);

      const loadedTask = tRes?.data || tRes || null;
      setTask(loadedTask);
      setComments(cRes?.data?.content || (Array.isArray(cRes?.data) ? cRes.data : []));
      setAttachments(aRes?.data || (Array.isArray(aRes) ? aRes : []));
      setActivities(actRes?.data?.content || (Array.isArray(actRes?.data) ? actRes.data : []));

      const pId = loadedTask?.projectId || loadedTask?.project?.id;
      if (pId) {
        const memRes = await projectService.getMembers(pId).catch(() => null);
        setMembers(memRes?.data?.content || memRes?.data || memRes || []);
      }
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    try {
      const payload = {
        title: task.title,
        description: task.description || '',
        status: newStatus,
        priority: task.priority || 'MEDIUM',
        assigneeId: task.assigneeId || task.assignee?.id || null,
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        estimatedHours: task.estimatedHours || null,
        actualHours: task.actualHours || null,
      };
      await taskService.updateTask(task.id, payload);
      setTask({ ...task, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchTaskData();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    try {
      await commentService.createComment({
        taskId: task.id,
        content: newComment.trim(),
      });
      setNewComment('');
      toast.success('Comment posted!');
      fetchTaskData();
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', task.id);
    if (task.projectId || task.project?.id) {
      formData.append('projectId', task.projectId || task.project.id);
    }

    try {
      await attachmentService.uploadAttachment(formData);
      toast.success('File attached successfully!');
      fetchTaskData();
    } catch (err) {
      toast.error('Upload failed');
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
      fetchTaskData();
      if (onTaskUpdated) onTaskUpdated();
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

  const canUpdateStatus = () => {
    if (!task || !user) return false;
    if (task.assignee?.id === user.id || task.assigneeId === user.id) return true;
    return canReassign();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        {/* Drawer slide-out */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {loading && !task ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !task ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-450">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              Failed to load task details
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-955/20">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                    TASK #{task.id}
                  </span>
                  <Badge type="priority" value={task.priority} />
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {task.description || 'No detailed specifications or requirement description provided.'}
                  </p>
                </div>

                {/* Status Actions */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Update Progress Status</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        disabled={!canUpdateStatus()}
                        title={!canUpdateStatus() ? "Only assigned user or managers can update status" : ""}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                          task.status === st
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metadata Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-405 block font-bold uppercase">Assignee</span>
                      {canReassign() && !isReassigning && (
                        <button
                          onClick={() => setIsReassigning(true)}
                          className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Reassign
                        </button>
                      )}
                    </div>

                    {isReassigning ? (
                      <div className="space-y-1.5">
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
                          className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-205 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>{task.assigneeName || 'Unassigned'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-405 block font-bold uppercase mb-1">Due Date</span>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-405 block font-bold uppercase mb-1">Estimated</span>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{task.estimatedHours || 4} Hours</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs: Comments vs Attachments vs History */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveTab('COMMENTS')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === 'COMMENTS'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
                    </button>

                    <button
                      onClick={() => setActiveTab('ATTACHMENTS')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === 'ATTACHMENTS'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Attachments ({attachments.length})
                    </button>

                    <button
                      onClick={() => setActiveTab('HISTORY')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === 'HISTORY'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" /> History ({activities.length})
                    </button>
                  </div>

                  {/* Comments Stream */}
                  {activeTab === 'COMMENTS' && (
                    <div className="space-y-4">
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add to task discussion thread..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none">
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No comments logged in discussion thread</p>
                        ) : (
                          comments.map((c) => (
                            <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                                <span>{c.authorName || 'Collaborator'}</span>
                                <span className="text-[10px] font-mono text-slate-400">{formatDateTime(c.createdAt)}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments Stream */}
                  {activeTab === 'ATTACHMENTS' && (
                    <div className="space-y-4">
                      <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-505 transition-colors text-xs text-slate-500">
                        <Upload className="w-4 h-4 text-blue-500" />
                        <span>{uploading ? 'Uploading stream...' : 'Click to upload task attachment stream'}</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                      </label>

                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-none">
                        {attachments.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No attachment files uploaded</p>
                        ) : (
                          attachments.map((att) => (
                            <div key={att.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate" title={att.fileName || att.filename}>{att.fileName || att.filename || 'File'}</span>
                                  <span className="text-[10px] font-mono text-slate-400">{att.fileType || 'Asset stream'}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDownloadAttachment(att.id, att.fileName || att.filename)}
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-955/60 text-blue-600 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px] shrink-0"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* History Stream */}
                  {activeTab === 'HISTORY' && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {activities.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No history logs recorded</p>
                      ) : (
                        activities.map((act) => (
                          <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                            <p className="text-slate-850 dark:text-slate-200 leading-normal">{act.description}</p>
                            <span className="text-[9px] font-mono text-slate-400 block text-right">{formatDateTime(act.createdAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailsDrawer;
