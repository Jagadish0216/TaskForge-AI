import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { projectService } from '../../services/services';

export const TaskModal = ({ isOpen, onClose, onSubmit, task = null, projects = [] }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId || task.project?.id || '',
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        assigneeId: task.assigneeId || task.assignee?.id || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
      });
      if (task.projectId || task.project?.id) {
        fetchProjectMembers(task.projectId || task.project?.id);
      }
    } else {
      setFormData({
        projectId: projects[0]?.id || '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: '',
        dueDate: '',
        estimatedHours: '',
      });
      if (projects[0]?.id) {
        fetchProjectMembers(projects[0].id);
      }
    }
  }, [task, isOpen, projects]);

  const fetchProjectMembers = async (pId) => {
    if (!pId) return;
    try {
      const res = await projectService.getMembers(pId);
      const list = res.data?.content || res.data || res || [];
      setMembers(list);
    } catch (err) {
      setMembers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'projectId') {
      fetchProjectMembers(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectId: Number(formData.projectId) || undefined,
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!task && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Project *
            </label>
            <select
              required
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">-- Choose Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectKey || p.key})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            name="title"
            placeholder="e.g. Implement User Authentication"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            name="description"
            placeholder="Add detailed task requirements..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignee
            </label>
            <select
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">Unassigned</option>
              {members.map((m) => {
                const u = m.user || m;
                const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                return (
                  <option key={u.id} value={u.id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hours
            </label>
            <input
              type="number"
              step="0.5"
              name="estimatedHours"
              placeholder="e.g. 8"
              value={formData.estimatedHours}
              onChange={handleChange}
              className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
          >
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
