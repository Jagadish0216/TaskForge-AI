import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { Loader2, Users2, Shield, Mail, Award, CheckCircle } from 'lucide-react';

const AdminTeams = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await adminService.getUsers();
        setUsers(res.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Group users by department
  const departments = (users || []).reduce((acc, user) => {
    const dept = user.department || 'General / Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(user);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.keys(departments).map((dept) => (
        <div key={dept} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Users2 className="h-4 w-4 text-blue-500" /> {dept} ({departments[dept].length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments[dept].map((u) => {
              const roleName = u.roles?.[0]?.name || 'ROLE_TEAM_MEMBER';
              return (
                <div key={u.id} className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-white border border-slate-700">
                    {u.firstName?.[0] || 'U'}
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <h4 className="font-bold text-white text-sm truncate">
                        {u.firstName || ''} {u.lastName || ''}
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {u.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Award className="h-3 w-3 text-blue-500" />
                      <span className="truncate">{u.designation || 'Team Member'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {roleName.replace('ROLE_', '')}
                      </span>
                      {u.enabled ? (
                        <span className="text-emerald-500 flex items-center gap-0.5">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="text-red-500">Blocked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminTeams;
