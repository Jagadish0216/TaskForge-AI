import { useState } from 'react';
import { FiMessageSquare, FiCornerDownRight, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { commentService } from '../../services/services';
import { formatDateTime, getInitials } from '../../utils/formatters';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

export const CommentSection = ({ taskId, comments = [], onRefresh }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [historyModal, setHistoryModal] = useState({ open: false, list: [] });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (parentId = null) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await commentService.createComment({
        taskId: Number(taskId),
        content,
        parentCommentId: parentId ? Number(parentId) : null,
      });
      toast.success('Comment posted!');
      if (parentId) {
        setReplyingTo(null);
        setReplyContent('');
      } else {
        setNewComment('');
      }
      onRefresh();
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return;
    try {
      await commentService.updateComment(id, { content: editContent });
      toast.success('Comment updated!');
      setEditingId(null);
      onRefresh();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(id);
      toast.success('Comment deleted');
      onRefresh();
    } catch (err) {}
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await commentService.getCommentHistory(id);
      setHistoryModal({ open: true, list: res.data || res || [] });
    } catch (err) {
      toast.error('Could not load edit history');
    }
  };

  const safeComments = Array.isArray(comments) ? comments : [];
  const topLevelComments = safeComments.filter((c) => !c.parentCommentId);
  const repliesMap = safeComments.reduce((acc, c) => {
    if (c.parentCommentId) {
      acc[c.parentCommentId] = acc[c.parentCommentId] || [];
      acc[c.parentCommentId].push(c);
    }
    return acc;
  }, {});

  const renderCommentItem = (item, isReply = false) => {
    const isEditing = editingId === item.id;
    const authorName =
      item.authorName ||
      item.authorEmail ||
      (item.author
        ? `${item.author.firstName || ''} ${item.author.lastName || ''}`.trim() || item.author.email
        : 'User');

    const itemReplies = item.replies && item.replies.length > 0 ? item.replies : repliesMap[item.id] || [];

    return (
      <div
        key={item.id}
        className={`p-3.5 rounded-xl bg-white border border-slate-200 ${
          isReply ? 'ml-6 border-l-2 border-l-blue-500' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {getInitials(authorName)}
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-xs">{authorName}</span>
              <span className="text-[10px] text-slate-400 ml-2">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {item.edited && (
              <button
                onClick={() => handleViewHistory(item.id)}
                title="View edit history"
                className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1"
              >
                <FiClock className="w-3 h-3" /> (Edited)
              </button>
            )}
            <button
              onClick={() => {
                setEditingId(item.id);
                setEditContent(item.content);
              }}
              className="p-1 text-slate-400 hover:text-blue-600 rounded"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(item.id)}
                className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {item.content}
          </p>
        )}

        {/* Reply button */}
        {!isReply && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              <FiCornerDownRight className="w-3.5 h-3.5" /> Reply
            </button>
          </div>
        )}

        {/* Reply form */}
        {replyingTo === item.id && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <textarea
              rows={2}
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyingTo(null)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreate(item.id)}
                disabled={submitting}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
              >
                Send Reply
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {itemReplies.length > 0 && (
          <div className="mt-3 space-y-2">
            {itemReplies.map((reply) => renderCommentItem(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FiMessageSquare className="text-blue-600 w-5 h-5" />
        <h3 className="font-bold text-slate-800 text-base">Comments & Discussion</h3>
      </div>

      {/* Primary New Comment Input */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
        <textarea
          rows={3}
          placeholder="Add a comment... (use @name to mention team members)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
        <div className="flex justify-end">
          <button
            onClick={() => handleCreate(null)}
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {topLevelComments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No comments yet. Be the first to start the discussion!</p>
        ) : (
          topLevelComments.map((item) => renderCommentItem(item, false))
        )}
      </div>

      {/* Edit History Modal */}
      <Modal
        isOpen={historyModal.open}
        onClose={() => setHistoryModal({ open: false, list: [] })}
        title="Comment Edit History"
      >
        <div className="space-y-3">
          {historyModal.list.length === 0 ? (
            <p className="text-xs text-slate-400">No previous versions found.</p>
          ) : (
            historyModal.list.map((h, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Edited on: {formatDateTime(h.editedAt || h.createdAt)}
                </span>
                <p className="text-slate-700 italic">"{h.oldContent}"</p>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CommentSection;
