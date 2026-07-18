import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import UserAutocomplete from '../common/UserAutocomplete';
import { projectService } from '../../services/services';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const TaskModal = ({ isOpen, onClose, onSubmit, task = null, projects = [] }) => {
  const { user } = useAuth();
  
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
  const [selectedAssignee, setSelectedAssignee] = useState(null);

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

  useEffect(() => {
    if (isOpen) {
      setSelectedAssignee(null);

      if (task) {
        setFormData({
          projectId: task.projectId || task.project?.id || '',
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'TODO',
          assigneeId: task.assigneeId || task.assignee?.id || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          estimatedHours: task.estimatedHours || '',
        });
        if (task.assignee) {
          setSelectedAssignee(task.assignee);
        }
        fetchProjectMembers(task.projectId || task.project?.id);
      } else {
        const defaultProjId = projects.length > 0 ? String(projects[0].id) : '';
        setFormData({
          projectId: defaultProjId,
          title: '',
          description: '',
          priority: 'MEDIUM',
          status: 'TODO',
          assigneeId: '',
          dueDate: '',
          estimatedHours: '',
        });
        if (defaultProjId) {
          fetchProjectMembers(defaultProjId);
        }
      }
    }
  }, [isOpen, task, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'projectId') {
      fetchProjectMembers(value);
      setSelectedAssignee(null);
      setFormData((prev) => ({ ...prev, assigneeId: '' }));
    }
  };

  const handleSelectAssignee = (u) => {
    setSelectedAssignee(u);
    setFormData((prev) => ({ ...prev, assigneeId: u.id }));
  };

  const handleRemoveAssignee = () => {
    setSelectedAssignee(null);
    setFormData((prev) => ({ ...prev, assigneeId: '' }));
  };

  // Permission Check: Owner, Manager, Admin
  const canAssign = () => {
    if (!user) return false;
    const isGlobalAdmin = user.roles?.includes('ROLE_ADMIN') || user.role === 'ROLE_ADMIN';
    const isGlobalPM = user.roles?.includes('ROLE_PROJECT_MANAGER') || user.role === 'ROLE_PROJECT_MANAGER';
    if (isGlobalAdmin || isGlobalPM) return true;

    const currentProj = projects.find((p) => String(p.id) === String(formData.projectId));
    if (currentProj && (currentProj.owner?.id === user.id || currentProj.ownerId === user.id)) {
      return true;
    }

    const myMemberRecord = members.find((m) => (m.user?.id === user.id || m.userId === user.id));
    if (myMemberRecord && (myMemberRecord.role === 'OWNER' || myMemberRecord.role === 'MANAGER')) {
      return true;
    }

    return false;
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
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task Specification' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {!task && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
              Select Project *
            </label>
            <select
              required
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            name="title"
            placeholder="e.g. Implement User Authentication"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            name="description"
            placeholder="Add detailed task requirements..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Autocomplete Assign To */}
          <div className="sm:col-span-2 relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Assign To
            </label>
            <UserAutocomplete
              selectedUser={selectedAssignee}
              onSelect={handleSelectAssignee}
              onRemove={handleRemoveAssignee}
              disabled={!canAssign()}
              onlyProjectMembers={true}
              members={members}
              placeholder={canAssign() ? "Search project member..." : "Assignment read-only (Permission required)"}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              min={1}
              name="estimatedHours"
              placeholder="e.g. 8"
              value={formData.estimatedHours}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-450 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
