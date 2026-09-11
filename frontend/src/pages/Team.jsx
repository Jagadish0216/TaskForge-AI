import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Search, Mail, Check, X, ArrowRight, MessageSquare } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { getInitials } from '../utils/formatters';
import { projectService } from '../services/services';
import ProjectDiscussion from '../components/projects/ProjectDiscussion';
import toast from 'react-hot-toast';

export const Team = () => {
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // DISCUSSION, MEMBERS, PERMISSIONS, INVITATIONS
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      fetchMembers(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      setProjects(list);
      if (list.length > 0) {
        setSelectedProject(list[0]);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchMembers = async (projectId) => {
    setLoadingMembers(true);
    try {
      const res = await projectService.getMembers(projectId);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setMembers(list);
    } catch (err) {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await projectService.getInvitations();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setInvitations(list);
    } catch (err) {
      setInvitations([]);
    }
  };

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [inviteMessage, setInviteMessage] = useState('');

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (!selectedProject?.id) {
      toast.error('Select a project to invite member to');
      return;
    }

    try {
      await projectService.inviteMember(selectedProject.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage,
      });
      toast.success(`Invitation dispatched to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRejectInvite = async (id) => {
    try {
      await projectService.rejectInvitation(id);
      toast.success('Invitation declined');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to decline invitation');
    }
  };

  const permissionsMatrix = [
    { cap: 'Create & Manage Projects', owner: true, manager: true, dev: false, qa: false, viewer: false },
    { cap: 'Create & Update Tasks', owner: true, manager: true, dev: true, qa: true, viewer: false },
    { cap: 'Delete Projects & Tasks', owner: true, manager: true, dev: false, qa: false, viewer: false },
    { cap: 'Upload & Stream Attachments', owner: true, manager: true, dev: true, qa: true, viewer: false },
    { cap: 'Trigger AI Backlog Engine', owner: true, manager: true, dev: true, qa: false, viewer: false },
    { cap: 'Manage Workspace & Team', owner: true, manager: false, dev: false, qa: false, viewer: false },
  ];

  const filteredMembers = members.filter((m) => {
    const name = m.user?.name || m.name || '';
    const email = m.user?.email || m.email || '';
    const role = m.role || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term) || role.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Team Workspace Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage project members, role permission matrix, and pending invitations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-500 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Global Project Context Selector */}
      {projects.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Project:</span>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const found = projects.find((p) => p.id === selectedId);
              if (found) setSelectedProject(found);
            }}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.name} ({p.projectKey || p.key})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: 'DISCUSSION', label: 'Discussion Log', icon: MessageSquare },
          { key: 'MEMBERS', label: `Project Members (${members.length})`, icon: Users },
          { key: 'PERMISSIONS', label: 'Role Permissions Matrix', icon: Shield },
          { key: 'INVITATIONS', label: `My Invitations (${invitations.length})`, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Discussion View */}
      {activeTab === 'DISCUSSION' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Project Discussion Log</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time collaboration channel for selected project</p>
          </div>

          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {selectedProject ? (
              <ProjectDiscussion
                key={selectedProject.id}
                projectId={selectedProject.id}
                projectOwnerId={selectedProject.owner?.id}
              />
            ) : (
              <EmptyState
                title="No Projects Available"
                description="Create or join a project to participate in discussions."
              />
            )}
          </div>
        </Card>
      )}

      {/* Active Members View */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {loadingMembers ? (
            <p className="text-xs text-slate-500 p-4">Loading project members...</p>
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              title="No Members Found"
              description="No members match your search filter for this project."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((m) => {
                const name = m.user?.name || m.name || 'Project Member';
                const email = m.user?.email || m.email || '';
                return (
                  <Card
                    key={m.id || email}
                    onClick={() => setSelectedMember(m)}
                    className="cursor-pointer hover:border-blue-500/40 transition-all flex items-start justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {getInitials(name)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{name}</h4>
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded uppercase">
                            {m.role || 'MEMBER'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Permissions Matrix View */}
      {activeTab === 'PERMISSIONS' && (
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Role Capability Matrix</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Capability / Operation</th>
                  <th className="py-3 px-4 text-center">Owner</th>
                  <th className="py-3 px-4 text-center">Manager</th>
                  <th className="py-3 px-4 text-center">Developer</th>
                  <th className="py-3 px-4 text-center">QA</th>
                  <th className="py-3 px-4 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionsMatrix.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{p.cap}</td>
                    <td className="py-3 px-4 text-center">{p.owner ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{p.manager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{p.dev ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{p.qa ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 px-4 text-center">{p.viewer ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invitations View */}
      {activeTab === 'INVITATIONS' && (
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Pending Workspace Invitations</h3>
          </div>

          {invitations.length === 0 ? (
            <EmptyState
              title="No Pending Invitations"
              description="You have no pending invitations to join projects."
            />
          ) : (
            <div className="space-y-3">
              {invitations.map((i) => (
                <div key={i.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{i.projectName || 'Project Invitation'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Role: {i.role}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRejectInvite(i.id)}
                    className="px-3 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Member Email Address
            </label>
            <input
              type="email"
              required
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="MANAGER">Manager</option>
              <option value="QA">QA Engineer</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Welcome Message
            </label>
            <textarea
              rows={2}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Dispatch Email Invitation
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Inspector Drawer */}
      <Modal isOpen={Boolean(selectedMember)} onClose={() => setSelectedMember(null)} title="Member Profile Specs">
        {selectedMember && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                {getInitials(selectedMember.user?.name || selectedMember.name || 'M')}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {selectedMember.user?.name || selectedMember.name || 'Member'}
                </h3>
                <p className="text-slate-400">{selectedMember.user?.email || selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Role & Access</h4>
              <p className="text-slate-500 dark:text-slate-400">
                Assigned Role: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{selectedMember.role || 'MEMBER'}</span>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Team;
