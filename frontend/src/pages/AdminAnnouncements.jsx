import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { Megaphone, Trash2, Edit2, Plus, X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, title: '', content: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await adminService.getAnnouncements();
      setAnnouncements(res.data || res);
    } catch (err) {
      toast.error('Failed to load system announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await adminService.updateAnnouncement(form.id, form);
        toast.success('Announcement updated successfully');
      } else {
        await adminService.createAnnouncement(form);
        toast.success('Announcement created successfully');
      }
      setShowModal(false);
      setForm({ id: null, title: '', content: '', active: true });
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ann) => {
    setForm({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      active: ann.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this announcement?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Announcements</span>
        </div>
        <button
          onClick={() => {
            setForm({ id: null, title: '', content: '', active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white leading-tight">{ann.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    ann.active ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/50' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {ann.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px] text-slate-500">
                <span>Created: {new Date(ann.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ann)}
                    className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 text-center py-20 text-slate-500 text-xs">
            No announcements created yet.
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {form.id ? 'Edit Announcement' : 'Create System Announcement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Important maintenance window..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Message Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Type the announcement details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none h-32 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded border border-slate-850">
                <div>
                  <span className="text-xs font-semibold text-white block">Status</span>
                  <span className="text-[10px] text-slate-500">Publish immediately to normal User Dashboard.</span>
                </div>
                <select
                  value={form.active ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
                  className="bg-slate-900 border border-slate-800 text-xs text-white rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
