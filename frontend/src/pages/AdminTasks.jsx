import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import {
  Search,
  CheckSquare,
  Edit2,
  Trash2,
  X,
  Loader2,
  ArrowRight,
  User,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Modals state
  const [moveTask, setMoveTask] = useState(null);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [assignTask, setAssignTask] = useState(null);
  const [targetUserId, setTargetUserId] = useState('');

  const fetchData = async () => {
    try {
      const [taskRes, projRes, userRes] = await Promise.all([
        adminService.getTasks(),
        adminService.getProjects(),
        adminService.getUsers()
      ]);
      setTasks(taskRes.data || taskRes);
      setProjects(projRes.data || projRes);
      setUsers(userRes.data || userRes);
    } catch (err) {
      toast.error('Failed to load global tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await adminService.deleteTask(id);
      toast.success('Task deleted successfully');
      fetchData();
      setSelectedTask(null);
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const handleMoveTask = async (e) => {
    e.preventDefault();
    if (!moveTask || !targetProjectId) return;
    try {
      await adminService.moveTask(moveTask.id, targetProjectId);
      toast.success('Task moved successfully');
      setMoveTask(null);
      setTargetProjectId('');
      fetchData();
      setSelectedTask(null);
    } catch (err) {
      toast.error('Failed to move task.');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!assignTask || !targetUserId) return;
    try {
      await adminService.assignTask(assignTask.id, targetUserId);
      toast.success('Task assigned successfully');
      setAssignTask(null);
      setTargetUserId('');
      fetchData();
      setSelectedTask(null);
    } catch (err) {
      toast.error('Failed to assign task.');
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await adminService.updateTaskStatus(task.id, status);
      toast.success('Task status updated');
      fetchData();
      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...selectedTask, status });
      }
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const filteredTasks = (tasks || []).filter((t) => {
    if (!t) return false;
    const q = searchQuery.toLowerCase();
    const title = t.title ? t.title.toLowerCase() : '';
    const desc = t.description ? t.description.toLowerCase() : '';
    const projName = t.project?.name ? t.project.name.toLowerCase() : '';
    return title.includes(q) || desc.includes(q) || projName.includes(q);
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tasks Table Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks globally by title, description or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Tasks Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`hover:bg-slate-850/50 cursor-pointer transition-colors ${
                      selectedTask?.id === t.id ? 'bg-slate-850/60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {t.project?.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {t.assignee ? t.assignee.email : <span className="text-slate-600 font-medium">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={t.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(t, e.target.value)}
                        className="bg-slate-950 border border-slate-850 text-xs text-slate-300 rounded px-2 py-0.5 focus:outline-none"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setMoveTask(t)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Move Project"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAssignTask(t)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Assign User"
                        >
                          <User className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-950/30 hover:text-red-300"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit space-y-6">
        {selectedTask ? (
          <>
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-base leading-tight">{selectedTask.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1 block uppercase">Project: {selectedTask.project?.name}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase">Description</span>
                <p className="text-slate-300 mt-1 text-xs leading-relaxed">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase">Priority</span>
                  <span className="text-slate-200 text-xs">{selectedTask.priority}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase">Due Date</span>
                  <span className="text-slate-200 text-xs">{selectedTask.dueDate || 'Not set'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase">Assignee Details</span>
                {selectedTask.assignee ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                      {selectedTask.assignee.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {selectedTask.assignee.firstName || ''} {selectedTask.assignee.lastName || ''}
                      </p>
                      <p className="text-[10px] text-slate-500">{selectedTask.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs block mt-1">Unassigned</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-3 text-slate-500">
            <CheckSquare className="h-10 w-10 mx-auto text-slate-600" />
            <p className="text-xs">Select a task from the table to view its full details and properties.</p>
          </div>
        )}
      </div>

      {/* Move Task Modal */}
      {moveTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Move Task to Project</h3>
              <button onClick={() => setMoveTask(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMoveTask} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Select Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectKey})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMoveTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Move Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {assignTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Assign Task</h3>
              <button onClick={() => setAssignTask(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAssignTask} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Select Assignee</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName || ''} {u.lastName || ''} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
