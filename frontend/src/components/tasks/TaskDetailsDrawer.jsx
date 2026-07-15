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
} from 'lucide-react';
import { taskService, commentService, attachmentService } from '../../services/services';
import Badge from '../common/Badge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const TaskDetailsDrawer = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('COMMENTS'); // COMMENTS, ATTACHMENTS, HISTORY

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTaskData();
    }
  }, [taskId, isOpen]);

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, aRes] = await Promise.all([
        taskService.getTaskById(taskId).catch(() => null),
        commentService.searchComments({ taskId }).catch(() => null),
        attachmentService.getAttachmentsByTask(taskId).catch(() => null),
      ]);

      setTask(tRes?.data || tRes || null);
      setComments(cRes?.data?.content || (Array.isArray(cRes?.data) ? cRes.data : []));
      setAttachments(aRes?.data || (Array.isArray(aRes) ? aRes : []));
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

    try {
      await attachmentService.uploadAttachment(formData);
      toast.success('File uploaded successfully!');
      fetchTaskData();
    } catch (err) {
      toast.error('Failed to upload attachment');
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                TASK-{task?.id || taskId}
              </span>
              {task && <Badge type="priority" value={task.priority} />}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <span className="text-xs font-mono text-slate-400">Loading task inspector...</span>
            </div>
          ) : !task ? (
            <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs">
              Task not found
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {task.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  {task.description || 'No detailed description specified.'}
                </p>
              </div>

              {/* Status Controls & Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase mb-1">Status</span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase mb-1">Assignee</span>
                  <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>{task.assigneeName || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase mb-1">Due Date</span>
                  <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase mb-1">Estimated</span>
                  <div className="flex items-center gap-1.5 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{task.estimatedHours || 4} Hours</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Comments vs Attachments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setActiveTab('COMMENTS')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'COMMENTS'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('ATTACHMENTS')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'ATTACHMENTS'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" /> Attachments ({attachments.length})
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
                        className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none"
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
                            <p className="text-slate-600 dark:text-slate-300">{c.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments Stream */}
                {activeTab === 'ATTACHMENTS' && (
                  <div className="space-y-4">
                    <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors text-xs text-slate-500">
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
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-blue-500" />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{att.fileName || att.filename || 'File'}</span>
                                <span className="text-[10px] font-mono text-slate-400">{att.fileType || 'Asset stream'}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadAttachment(att.id, att.fileName || att.filename)}
                              className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px]"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailsDrawer;
