import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FolderKanban } from 'lucide-react';
import { projectService } from '../services/services';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import LoadingSpinner, { SkeletonCard } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, ARCHIVED

  const [modalState, setModalState] = useState({ open: false, project: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      setProjects(list);
    } catch (err) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (modalState.project) {
        await projectService.updateProject(modalState.project.id, data);
        toast.success('Project updated successfully');
        setModalState({ open: false, project: null });
        fetchProjects();
      } else {
        const res = await projectService.createProject(data);
        const createdProject = res.data || res;
        toast.success('Project created successfully!');
        setModalState({ open: false, project: null });
        if (createdProject && createdProject.id) {
          navigate(`/projects/${createdProject.id}`);
        } else {
          fetchProjects();
        }
      }
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const handleArchive = async (id) => {
    try {
      await projectService.archiveProject(id);
      toast.success('Project archived');
      fetchProjects();
    } catch (err) {}
  };

  const handleRestore = async (id) => {
    try {
      await projectService.restoreProject(id);
      toast.success('Project restored');
      fetchProjects();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be permanently removed.')) {
      return;
    }
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (err) {}
  };

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        if (!p) return false;
        const name = (p.name || '').toLowerCase();
        const key = (p.projectKey || p.key || '').toLowerCase();
        const q = (search || '').toLowerCase();
        const matchesSearch = name.includes(q) || key.includes(q);
        if (filter === 'ACTIVE') return matchesSearch && !p.archived;
        if (filter === 'ARCHIVED') return matchesSearch && p.archived;
        return matchesSearch;
      })
    : [];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Projects Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage all company projects, team assignments, and visibility parameters
          </p>
        </div>

        <button
          onClick={() => setModalState({ open: true, project: null })}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="text-slate-400 w-4 h-4" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            <option value="ACTIVE">Active Projects</option>
            <option value="ARCHIVED">Archived Projects</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your search filters or create your first project."
          action={
            <button
              onClick={() => setModalState({ open: true, project: null })}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setModalState({ open: true, project: p })}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ProjectModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, project: null })}
        onSubmit={handleCreateOrUpdate}
        project={modalState.project}
      />
    </div>
  );
};

export default Projects;
