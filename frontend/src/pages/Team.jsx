import { useState } from 'react';
import { Users, UserPlus, Shield, Search, Mail, Check, X, ArrowRight, Activity, Code, Layers } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Team = () => {
  const [activeTab, setActiveTab] = useState('MEMBERS'); // MEMBERS, PERMISSIONS, INVITATIONS
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [inviteMessage, setInviteMessage] = useState('Join our high-velocity software engineering squad on TaskForge AI.');

  const [members, setMembers] = useState([
    { id: 1, name: 'Jagadish K', email: 'admin@taskforge.com', role: 'OWNER', dept: 'Engineering', status: 'online', tasks: 12, projects: 5, skills: ['Spring Boot', 'React', 'TypeScript'] },
    { id: 2, name: 'Sarah Lin', email: 'sarah.lin@company.com', role: 'MANAGER', dept: 'Product', status: 'online', tasks: 8, projects: 4, skills: ['Agile', 'Product Strategy', 'UI/UX'] },
    { id: 3, name: 'Marcus Vance', email: 'marcus.vance@company.com', role: 'DEVELOPER', dept: 'Backend', status: 'offline', tasks: 15, projects: 3, skills: ['Java 21', 'Kubernetes', 'PostgreSQL'] },
    { id: 4, name: 'Elena Rostova', email: 'elena.rostova@company.com', role: 'QA', dept: 'Quality Assurance', status: 'online', tasks: 6, projects: 4, skills: ['Selenium', 'Playwright', 'Junit5'] },
  ]);

  const [invitations, setInvitations] = useState([
    { id: 101, email: 'devyn.chen@consultant.com', role: 'DEVELOPER', invitedBy: 'admin@taskforge.com', status: 'PENDING', date: '2026-07-12' },
  ]);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newInv = {
      id: Date.now(),
      email: inviteEmail.trim(),
      role: inviteRole,
      invitedBy: 'admin@taskforge.com',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
    };

    setInvitations([...invitations, newInv]);
    toast.success(`Invitation dispatched to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRevokeInvite = (id) => {
    setInvitations(invitations.filter((i) => i.id !== id));
    toast.success('Invitation revoked');
  };

  const permissionsMatrix = [
    { cap: 'Create & Manage Projects', owner: true, manager: true, dev: false, qa: false, viewer: false },
    { cap: 'Create & Update Tasks', owner: true, manager: true, dev: true, qa: true, viewer: false },
    { cap: 'Delete Projects & Tasks', owner: true, manager: true, dev: false, qa: false, viewer: false },
    { cap: 'Upload & Stream Attachments', owner: true, manager: true, dev: true, qa: true, viewer: false },
    { cap: 'Trigger AI Backlog Engine', owner: true, manager: true, dev: true, qa: false, viewer: false },
    { cap: 'Manage Workspace & Team', owner: true, manager: false, dev: false, qa: false, viewer: false },
  ];

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Team Workspace Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organization members, role permission matrix, and pending invitations
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'MEMBERS', label: `Active Members (${members.length})`, icon: Users },
          { key: 'PERMISSIONS', label: 'Role Permissions Matrix', icon: Shield },
          { key: 'INVITATIONS', label: `Pending Invitations (${invitations.length})`, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 ${
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

      {/* Active Members View */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredMembers.map((m) => (
              <Card
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="cursor-pointer hover:border-blue-500/40 transition-all flex items-start justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {getInitials(m.name)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        m.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{m.name}</h4>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded uppercase">
                        {m.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Dept: {m.dept} • {m.tasks} assigned tasks</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </Card>
            ))}
          </div>
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
            <p className="text-xs text-slate-400 py-6 text-center">No pending invitations</p>
          ) : (
            <div className="space-y-3">
              {invitations.map((i) => (
                <div key={i.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{i.email}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Role: {i.role} • Invited by {i.invitedBy}</span>
                  </div>
                  <button
                    onClick={() => handleRevokeInvite(i.id)}
                    className="px-3 py-1 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100"
                  >
                    Revoke Token
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
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
                {getInitials(selectedMember.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedMember.name}</h3>
                <p className="text-slate-400">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Skills & Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-mono font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Workload Statistics</h4>
              <p className="text-slate-500 dark:text-slate-400">Assigned Tasks: <span className="font-bold text-slate-900 dark:text-slate-100">{selectedMember.tasks} active tasks</span></p>
              <p className="text-slate-500 dark:text-slate-400">Participating Projects: <span className="font-bold text-slate-900 dark:text-slate-100">{selectedMember.projects} projects</span></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Team;
