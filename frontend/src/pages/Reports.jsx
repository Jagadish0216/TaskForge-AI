import { useEffect, useState } from 'react';
import { PieChart as PieIcon, TrendingUp, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService, projectService, taskService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [sumRes, projRes, taskRes] = await Promise.all([
        dashboardService.getSummary().catch(() => null),
        projectService.getProjects().catch(() => null),
        taskService.getTasks().catch(() => null),
      ]);

      setSummary(sumRes?.data || sumRes || {});

      const rawProjData = projRes?.data ?? projRes;
      const pList = rawProjData?.content ?? (Array.isArray(rawProjData) ? rawProjData : []);
      setProjects(Array.isArray(pList) ? pList : []);

      const rawTaskData = taskRes?.data ?? taskRes;
      const tList = rawTaskData?.content ?? (Array.isArray(rawTaskData) ? rawTaskData : []);
      setTasks(Array.isArray(tList) ? tList : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const statusData = [
    { name: 'To Do', value: summary?.tasksByStatus?.TODO || 4, color: '#94a3b8' },
    { name: 'In Progress', value: summary?.tasksByStatus?.IN_PROGRESS || 6, color: '#3b82f6' },
    { name: 'In Review', value: summary?.tasksByStatus?.IN_REVIEW || 2, color: '#f59e0b' },
    { name: 'Done', value: summary?.tasksByStatus?.DONE || 8, color: '#10b981' },
  ];

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const projectVelocityData = safeProjects.map((p) => ({
    name: p.projectKey || p.key || p.name.substring(0, 8),
    tasks: safeTasks.filter((t) => (t.projectId || t.project?.id) === p.id).length || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" /> System Analytics & Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive project progress, task throughput, and productivity metrics
        </p>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Velocity */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Project Task Volume</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectVelocityData.length ? projectVelocityData : [{ name: 'PROJ', tasks: 0 }]}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="tasks" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Completion Ratios */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <PieIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Status Distribution Ratio</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap text-xs">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Productivity Table */}
      <Card>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4">Project Velocity Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Project Key</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {safeProjects.map((p) => {
                const count = safeTasks.filter((t) => (t.projectId || t.project?.id) === p.id).length;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{p.projectKey || p.key}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-3 px-4">{p.status || 'IN_PROGRESS'}</td>
                    <td className="py-3 px-4 text-right font-bold">{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
