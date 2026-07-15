import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

export const ProjectModal = ({ isOpen, onClose, onSubmit, project = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    visibility: 'PUBLIC',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        key: project.key || project.projectKey || '',
        description: project.description || '',
        priority: project.priority || 'MEDIUM',
        status: project.status || 'PLANNING',
        visibility: project.visibility || 'PUBLIC',
      });
    } else {
      setFormData({
        name: '',
        key: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PLANNING',
        visibility: 'PUBLIC',
      });
    }
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !project) {
        updated.key = value
          .replaceAll(/[^a-zA-Z]/g, '')
          .toUpperCase()
          .slice(0, 4);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = project
        ? {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            visibility: formData.visibility,
          }
        : {
            name: formData.name,
            projectKey: formData.key,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            visibility: formData.visibility,
          };
      await onSubmit(payload);
      onClose();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="e.g. Mobile Banking App"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Key * (Short Code)
          </label>
          <input
            type="text"
            required
            disabled={Boolean(project)}
            maxLength={10}
            name="key"
            placeholder="e.g. BANK"
            value={formData.key}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 uppercase disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            name="description"
            placeholder="Provide brief goals and scope..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {project && (
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
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}

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
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
