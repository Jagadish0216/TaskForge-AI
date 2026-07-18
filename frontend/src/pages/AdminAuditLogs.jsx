import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { Search, History, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ search, type });
      setLogs(res.data || res);
    } catch (err) {
      toast.error('Failed to load system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [type]); // Automatically reload when type changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const activityTypes = [
    'USER_REGISTERED',
    'USER_LOGGED_IN',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'PROJECT_ARCHIVED',
    'PROJECT_RESTORED',
    'OWNERSHIP_TRANSFERRED',
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_DELETED',
    'COMMENT_ADDED',
    'ATTACHMENT_UPLOADED',
    'USER_UPDATED'
  ];

  return (
    <div className="space-y-6">
      {/* Search and filter toolbar */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by keyword or user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-11 pr-4 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-950 border border-slate-850 text-sm text-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">-- All Event Types --</option>
            {activityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg"
            title="Refresh Logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/45">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 uppercase">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">{log.description}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{log.userEmail}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 text-xs">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
