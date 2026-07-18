import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  CheckCircle,
  XCircle,
  Briefcase,
  History,
  X,
  Loader2,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // User Associated Data tabs
  const [userProjects, setUserProjects] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // details, projects, activities

  // Modals state
  const [editUser, setEditUser] = useState(null);
  const [resetPwdUser, setResetPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || res);
    } catch (err) {
      toast.error('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setActiveTab('details');
    try {
      const [projRes, actRes] = await Promise.all([
        adminService.getUserProjects(user.id),
        adminService.getUserActivities(user.id)
      ]);
      setUserProjects(projRes.data || projRes);
      setUserActivities(actRes.data || actRes);
    } catch (err) {
      console.error('Error fetching user detailed data', err);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const updatedEnabled = !user.enabled;
      await adminService.updateUser(user.id, { enabled: updatedEnabled });
      toast.success(`User ${updatedEnabled ? 'activated' : 'blocked'} successfully`);
      fetchUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, enabled: updatedEnabled });
      }
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User soft deleted successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const data = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        username: editUser.username,
        phoneNumber: editUser.phoneNumber,
        gender: editUser.gender,
        country: editUser.country,
        city: editUser.city,
        department: editUser.department,
        designation: editUser.designation,
        skills: editUser.skills,
        role: editUser.roleName
      };
      await adminService.updateUser(editUser.id, data);
      toast.success('User profile updated successfully');
      setEditUser(null);
      fetchUsers();
      if (selectedUser?.id === editUser.id) {
        setSelectedUser({ ...selectedUser, ...data });
      }
    } catch (err) {
      toast.error('Failed to update user profile.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    try {
      await adminService.resetPassword(resetPwdUser.id, { password: newPassword });
      toast.success('Password reset successfully');
      setResetPwdUser(null);
      setNewPassword('');
    } catch (err) {
      toast.error('Failed to reset password.');
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    if (!u) return false;
    if (u.deleted) return false;
    const q = searchQuery.toLowerCase();
    const email = u.email ? u.email.toLowerCase() : '';
    const firstName = u.firstName ? u.firstName.toLowerCase() : '';
    const lastName = u.lastName ? u.lastName.toLowerCase() : '';
    const username = u.username ? u.username.toLowerCase() : '';
    return (
      email.includes(q) ||
      firstName.includes(q) ||
      lastName.includes(q) ||
      username.includes(q)
    );
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
      {/* Users List Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredUsers.map((u) => {
                  const roleName = u.roles?.[0]?.name || 'ROLE_TEAM_MEMBER';
                  return (
                    <tr
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`hover:bg-slate-850/50 cursor-pointer transition-colors ${
                        selectedUser?.id === u.id ? 'bg-slate-850/60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 border border-slate-700">
                            {u.firstName?.[0] || (u.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white leading-tight">
                              {u.firstName || ''} {u.lastName || ''}
                            </p>
                            <p className="text-xs text-slate-500 leading-none mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {roleName.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.enabled ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const rName = u.roles?.[0]?.name || 'ROLE_TEAM_MEMBER';
                              setEditUser({ ...u, roleName: rName });
                            }}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Edit Profile"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setResetPwdUser(u)}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Reset Password"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title={u.enabled ? 'Block User' : 'Activate User'}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded text-red-400 hover:bg-red-950/30 hover:text-red-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Sidebar Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit space-y-6">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white">
                {selectedUser.firstName?.[0] || (selectedUser.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {selectedUser.firstName || ''} {selectedUser.lastName || ''}
                </h3>
                <p className="text-xs text-slate-400 leading-none mt-1">{selectedUser.email}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'details' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'projects' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Projects ({userProjects.length})
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex-1 pb-2 font-semibold uppercase tracking-wider text-center border-b-2 ${
                  activeTab === 'activities' ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'
                }`}
              >
                Activities
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 pt-2">
              {activeTab === 'details' && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Username</span>
                    <span className="text-slate-200">{selectedUser.username || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Department / Designation</span>
                    <span className="text-slate-200">
                      {selectedUser.department || 'Not set'} {selectedUser.designation ? `(${selectedUser.designation})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Phone Number</span>
                    <span className="text-slate-200">{selectedUser.phoneNumber || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Country / City</span>
                    <span className="text-slate-200">
                      {selectedUser.city ? `${selectedUser.city}, ` : ''}{selectedUser.country || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Skills</span>
                    <span className="text-slate-200">{selectedUser.skills || 'Not set'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {userProjects.length > 0 ? (
                    userProjects.map((p) => (
                      <div key={p.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-white leading-tight">{p.name}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block uppercase">Key: {p.projectKey}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 font-medium">
                          {p.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No projects assigned.</p>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {userActivities.length > 0 ? (
                    userActivities.map((act) => (
                      <div key={act.id} className="text-xs bg-slate-950 p-2.5 border border-slate-850 rounded">
                        <p className="text-slate-300 font-medium">{act.description}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No recent activities recorded.</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-3 text-slate-500">
            <Users className="h-10 w-10 mx-auto text-slate-600" />
            <p className="text-xs">Select a user from the table to view their details, assigned projects, and activity streams.</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Edit User Profile</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editUser.firstName || ''}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editUser.lastName || ''}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editUser.email || ''}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Username</label>
                  <input
                    type="text"
                    value={editUser.username || ''}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editUser.phoneNumber || ''}
                    onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Department</label>
                  <input
                    type="text"
                    value={editUser.department || ''}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Designation</label>
                  <input
                    type="text"
                    value={editUser.designation || ''}
                    onChange={(e) => setEditUser({ ...editUser, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">User Role</label>
                <select
                  value={editUser.roleName || 'ROLE_TEAM_MEMBER'}
                  onChange={(e) => setEditUser({ ...editUser, roleName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
                  <option value="ROLE_TEAM_MEMBER">Team Member</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Reset Password</h3>
              <button onClick={() => setResetPwdUser(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new plain text password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwdUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
