import { useState, useEffect } from 'react';
import { adminService, projectService, discussionService } from '../services/services';
import {
  Search,
  Archive,
  Trash2,
  Share2,
  Users,
  MessageSquare,
  X,
  Loader2,
  RefreshCw,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Detail panel tabs
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, members, discussion
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Modals state
  const [transferProj, setTransferProj] = useState(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        adminService.getProjects(),
        adminService.getUsers()
      ]);
      setProjects(projRes.data || projRes);
      setUsers(userRes.data || userRes);
    } catch (err) {
      toast.error('Failed to load system projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setActiveTab('metrics');
    try {
      const [membersRes, msgRes] = await Promise.all([
        projectService.getMembers(project.id),
        discussionService.getMessages(project.id)
      ]);
      setMembers(membersRes.data || membersRes);
      setMessages(msgRes.data || msgRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveProject = async (p) => {
    try {
      if (p.archived) {
        await adminService.restoreProject(p.id);
        toast.success('Project restored successfully');
      } else {
        await adminService.archiveProject(p.id);
        toast.success('Project archived successfully');
      }
      fetchData();
      if (selectedProject?.id === p.id) {
        setSelectedProject({ ...selectedProject, archived: !p.archived });
      }
    } catch (err) {
      toast.error('Failed to archive/restore project.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? All associated tasks and data will be destroyed.')) return;
    try {
      await adminService.deleteProject(id);
      toast.success('Project deleted successfully');
      fetchData();
      setSelectedProject(null);
    } catch (err) {
      toast.error('Failed to delete project.');
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!newOwnerId) return;
    try {
      await adminService.transferOwnership(transferProj.id, newOwnerId);
      toast.success('Ownership transferred successfully');
      setTransferProj(null);
      setNewOwnerId('');
      fetchData();
      if (selectedProject?.id === transferProj.id) {
        const o = users.find(u => u.id === parseInt(newOwnerId));
        setSelectedProject({ ...selectedProject, owner: o });
      }
    } catch (err) {
      toast.error('Failed to transfer ownership.');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await projectService.inviteMember(selectedProject.id, { email: inviteEmail, role: 'ROLE_TEAM_MEMBER' });
      toast.success('Member invited successfully');
      setInviteEmail('');
      const membersRes = await projectService.getMembers(selectedProject.id);
      setMembers(membersRes.data || membersRes);
    } catch (err) {
      toast.error('Failed to invite member. Make sure they are registered.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await projectService.removeMember(selectedProject.id, memberId);
      toast.success('Member removed');
      const membersRes = await projectService.getMembers(selectedProject.id);
      setMembers(membersRes.data || membersRes);
    } catch (err) {
      toast.error('Failed to remove member.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await discussionService.postMessage(selectedProject.id, { message: newMessage });
      setNewMessage('');
      const msgRes = await discussionService.getMessages(selectedProject.id);
      setMessages(msgRes.data || msgRes);
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  const filteredProjects = (projects || []).filter((p) => {
    if (!p) return false;
    const q = searchQuery.toLowerCase();
    const name = p.name ? p.name.toLowerCase() : '';
    const key = p.projectKey ? p.projectKey.toLowerCase() : '';
    const desc = p.description ? p.description.toLowerCase() : '';
    return name.includes(q) || key.includes(q) || desc.includes(q);
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
      {/* Projects List Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Projects list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className={`hover:bg-slate-850/50 cursor-pointer transition-colors ${
                      selectedProject?.id === p.id ? 'bg-slate-850/60' : ''
                    } ${p.archived ? 'opacity-65' : ''}`}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight flex items-center gap-2">
                          {p.name}
                          {p.aiGenerated && (
                            <span className="text-[10px] bg-purple-900/40 text-purple-400 border border-purple-800/50 px-1.5 py-0.5 rounded font-medium">
                              AI Generated
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 leading-none mt-1">Key: {p.projectKey}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {p.owner?.email || 'System'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        p.archived ? 'bg-amber-950/40 text-amber-500 border border-amber-900/50' : 'bg-blue-950/40 text-blue-400 border border-blue-900/50'
                      }`}>
                        {p.archived ? 'Archived' : p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setTransferProj(p)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Transfer Ownership"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveProject(p)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                          title={p.archived ? 'Restore Project' : 'Archive Project'}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-950/30 hover:text-red-300"
                          title="Delete Project"
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
        {selectedProject ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{selectedProject.name}</h3>
                <span className="text-[10px] text-slate-500 mt-1 block uppercase">Owner: {selectedProject.owner?.email}</span>
              </div>
              {selectedProject.archived && (
                <span className="text-xs px-2 py-0.5 bg-amber-950/40 text-amber-500 border border-amber-900/50 rounded font-semibold">
                  Archived
                </span>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'metrics' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'members' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'discussion' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Chat
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
              {activeTab === 'metrics' && (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Description</span>
                    <p className="text-slate-300 mt-1 text-xs leading-relaxed">
                      {selectedProject.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block uppercase">Priority</span>
                      <span className="text-slate-200 text-xs">{selectedProject.priority}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block uppercase">Visibility</span>
                      <span className="text-slate-200 text-xs">{selectedProject.visibility}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block uppercase">Start Date</span>
                      <span className="text-slate-200 text-xs">{selectedProject.startDate || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block uppercase">End Date</span>
                      <span className="text-slate-200 text-xs">{selectedProject.endDate || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  {/* Add Member Form */}
                  <form onSubmit={handleInviteMember} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Add member by email..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-blue-600 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Invite
                    </button>
                  </form>

                  {/* Members List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {members.length > 0 ? (
                      members.map((m) => (
                        <div key={m.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {m.user?.firstName || ''} {m.user?.lastName || m.user?.email}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-0.5 block uppercase">{m.role.replace('ROLE_', '')}</span>
                          </div>
                          {m.role !== 'OWNER' && (
                            <button
                              onClick={() => handleRemoveMember(m.user?.id || m.id)}
                              className="text-red-400 hover:text-red-300 font-semibold text-[10px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">No members assigned.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="space-y-3">
                  {/* Messages Feed */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 flex flex-col">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div key={msg.id} className="bg-slate-950 border border-slate-850 p-2 rounded text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-blue-400">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300 leading-normal">{msg.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-8">No messages in discussion board.</p>
                    )}
                  </div>

                  {/* Send Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type discussion message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1.5 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-3 text-slate-500">
            <Users className="h-10 w-10 mx-auto text-slate-600" />
            <p className="text-xs">Select a project from the table to view its metrics, details, member allocations, and discussion chat.</p>
          </div>
        )}
      </div>

      {/* Transfer Ownership Modal */}
      {transferProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Transfer Project Ownership</h3>
              <button onClick={() => setTransferProj(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTransferOwnership} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Select New Owner</label>
                <select
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                >
                  <option value="">-- Choose New Owner --</option>
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
                  onClick={() => setTransferProj(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Transfer Ownership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
