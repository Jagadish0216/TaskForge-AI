import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, MoreVertical, Edit2, Trash2, Copy, Check, X, Smile, Paperclip, AtSign, Search } from 'lucide-react';
import { discussionService } from '../../services/services';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, formatDateTime, getAvatarUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const ProjectDiscussion = ({ projectId, projectOwnerId, onMessagesCountChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal state
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  // Hovered message state to show action bar
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Start Polling every 3 seconds
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    // Only scroll to bottom on initial load
    scrollToBottom();
  }, [messages.length]);

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await discussionService.getMessages(projectId);
      const list = res.data || res || [];
      setMessages(list);
      if (onMessagesCountChange) {
        onMessagesCountChange(list.length);
      }
    } catch (err) {
      if (showLoading) {
        toast.error('Failed to load discussion feed');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await discussionService.postMessage(projectId, { message: text });
      setText('');
      await fetchMessages(false);
      scrollToBottom();
    } catch (err) {
      toast.error('Message delivery failed');
    } finally {
      setSending(false);
    }
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.message);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      await discussionService.editMessage(projectId, msgId, { message: editText });
      toast.success('Message updated');
      setEditingMessageId(null);
      fetchMessages(false);
    } catch (err) {
      toast.error('Failed to edit message');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await discussionService.deleteMessage(projectId, msgId);
      toast.success('Message deleted');
      setDeletingMessageId(null);
      fetchMessages(false);
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleCopyMessage = (msgText) => {
    navigator.clipboard.writeText(msgText);
    toast.success('Copied!');
  };

  const highlightMentions = (msgText) => {
    if (!msgText) return '';
    const words = msgText.split(/(\s+)/);
    return words.map((word, idx) => {
      if (word.startsWith('@')) {
        return (
          <span key={idx} className="font-bold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const insertMention = () => {
    setText((prev) => prev + ' @');
  };

  // Filter messages based on query
  const filteredMessages = messages.filter((msg) =>
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canDelete = (msg) => {
    if (!user) return false;
    const isSender = msg.senderId === user.id || msg.senderEmail === user.email;
    const isProjectOwner = projectOwnerId === user.id;
    const isAdmin = user.role === 'ROLE_ADMIN';
    return isSender || isProjectOwner || isAdmin;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-12">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Synchronizing feed...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
      {/* Search Header Bar */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Feed Discussion</h4>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-[11px] border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none"
      >
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === user?.id || msg.senderEmail === user?.email;
            const isEditing = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`group flex items-start gap-3 max-w-[85%] relative ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* User Avatar */}
                {msg.senderAvatarUrl ? (
                  <img
                    src={getAvatarUrl(msg.senderAvatarUrl)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0 uppercase">
                    {getInitials(msg.senderName || 'User')}
                  </div>
                )}

                {/* Message Bubble + Actions */}
                <div className="space-y-1 w-full">
                  <div className={`text-[10px] text-slate-400 flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {msg.senderName || 'Anonymous'}
                    </span>
                    <span className="font-mono text-[9px] opacity-85">{formatDateTime(msg.createdAt)}</span>
                    {msg.edited && (
                      <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-400 italic">edited</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 p-2 bg-slate-550/10 rounded-2xl border border-blue-500/40">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-transparent border-0 text-xs focus:ring-0 focus:outline-none text-slate-900 dark:text-slate-100 resize-none h-14"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="p-1 text-slate-450 hover:text-slate-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          disabled={savingEdit}
                          className="p-1 text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap border ${
                          isMe
                            ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {highlightMentions(msg.message)}
                      </div>

                      {/* Floating Actions Menu on Hover */}
                       <div className={`absolute -top-3.5 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-0.5 shadow-md z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 ${isMe ? 'right-2' : 'left-2'}`}>
                        <button
                          onClick={() => handleCopyMessage(msg.message)}
                          title="Copy text"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {isMe && (
                          <button
                            onClick={() => handleStartEdit(msg)}
                            title="Edit message"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {canDelete(msg) && (
                          <button
                            onClick={() => setDeletingMessageId(msg.id)}
                            title="Delete message"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-400 opacity-50" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-350 text-sm">No discussions yet</p>
              <p className="text-[11px] text-slate-500">Start collaborating with your team.</p>
            </div>
            <button
              onClick={() => {
                setText('Let\'s align on task completion dates!');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Start Conversation
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex gap-2">
        <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-blue-500">
          <textarea
            placeholder="Type your message... (Press Enter to send, Shift+Enter for newline)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full pl-4 pr-24 py-2.5 bg-transparent border-0 text-xs focus:ring-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none h-10 scrollbar-none"
            disabled={sending}
          />
          <div className="absolute right-3 flex items-center gap-1">
            <button
              type="button"
              onClick={insertMention}
              title="Mention teammates"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
            >
              <AtSign className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Add Emoji (UI Only)"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors cursor-default"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Attach File (UI Only)"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors cursor-default"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Delete Confirmation Dialog Modal */}
      {deletingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Delete Message?</h4>
              <p className="text-xs text-slate-500">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingMessageId(null)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(deletingMessageId)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDiscussion;
