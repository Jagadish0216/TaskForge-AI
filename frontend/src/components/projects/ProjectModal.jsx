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
    phase: 'Planning',
    teamSize: '1-5',
    techStack: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
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
        phase: project.phase || 'Planning',
        teamSize: project.teamSize || '1-5',
        techStack: project.techStack || '',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate || '',
      });
    } else {
      setFormData({
        name: '',
        key: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PLANNING',
        visibility: 'PUBLIC',
        phase: 'Planning',
        teamSize: '1-5',
        techStack: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
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
            phase: formData.phase,
            teamSize: formData.teamSize,
            techStack: formData.techStack,
            startDate: formData.startDate,
            endDate: formData.endDate || null,
          }
        : {
            name: formData.name,
            projectKey: formData.key,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            visibility: formData.visibility,
            phase: formData.phase,
            teamSize: formData.teamSize,
            techStack: formData.techStack,
            startDate: formData.startDate,
            endDate: formData.endDate || null,
          };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
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
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="e.g. Mobile Banking App"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
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
            className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 uppercase disabled:bg-slate-100 dark:disabled:bg-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            name="description"
            placeholder="Provide brief goals and scope..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Project Phase
            </label>
            <input
              type="text"
              name="phase"
              placeholder="e.g. Planning"
              value={formData.phase}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Estimated Team Size
            </label>
            <input
              type="text"
              name="teamSize"
              placeholder="e.g. 1-5"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Deadline (End Date)
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
            Technology Stack
          </label>
          <input
            type="text"
            name="techStack"
            placeholder="e.g. React, Spring Boot, MySQL"
            value={formData.techStack}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        {project && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
