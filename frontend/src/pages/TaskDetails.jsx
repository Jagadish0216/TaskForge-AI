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
} from 'react-icons/fi';
import { taskService, attachmentService, commentService } from '../services/services';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentSection from '../components/comments/CommentSection';
import { formatDate, getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, aRes] = await Promise.all([
        taskService.getTaskById(id).catch(() => null),
        commentService.searchComments({ taskId: Number(id) }).catch(() => null),
        attachmentService.getAttachmentsByTask(id).catch(() => null),
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

  if (loading) return <LoadingSpinner fullScreen />;
  if (!task) return null;

  return (
    <div className="space-y-6">
      {/* Task Header Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-600 rounded">
                TASK #{task.id}
              </span>
              <Badge type="status" value={task.status} />
              <Badge type="priority" value={task.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{task.title}</h1>
          </div>

          {/* Quick Info Grid */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5">
              <FiUser className="text-blue-600" />
              <span>Assignee: <strong>{task.assignee?.name || task.assignee?.email || 'Unassigned'}</strong></span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <FiCalendar className="text-amber-600" />
                <span>Due: <strong>{formatDate(task.dueDate)}</strong></span>
              </div>
            )}

            {task.estimatedHours && (
              <div className="flex items-center gap-1.5">
                <FiClock className="text-purple-600" />
                <span>Estimate: <strong>{task.estimatedHours} hrs</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Task Description */}
        <div className="pt-4">
          <h3 className="font-bold text-slate-800 text-sm mb-2">Task Requirements & Details</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
            {task.description || 'No detailed description provided for this task.'}
          </p>
        </div>
      </Card>

      {/* Attachments Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiPaperclip className="text-blue-600 w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Attachments</h3>
          </div>

          <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5">
            <FiUpload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="divide-y divide-slate-100">
          {!attachments || attachments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No file attachments linked to this task.</p>
          ) : (
            attachments.map((att) => (
              <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FiPaperclip className="text-slate-400" />
                  <span className="font-semibold text-slate-700">{att.fileName}</span>
                  <span className="text-[10px] text-slate-400">({(att.fileSize / 1024).toFixed(1)} KB)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAttachment(att.id, att.fileName)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Download file"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete file"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Comment Section Component */}
      <CommentSection
        taskId={task.id}
        comments={comments}
        onRefresh={fetchTask}
      />
    </div>
  );
};

export default TaskDetails;
