import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { Cpu, Loader2, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AdminAiUsage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAiStats = async () => {
      try {
        const res = await adminService.getAnalytics();
        setData(res.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAiStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">AI Generated Projects</span>
            <p className="text-2xl font-bold text-white tracking-tight mt-1">{data?.totalAIProjects || 0}</p>
          </div>
          <Cpu className="h-8 w-8 text-purple-500 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">AI Integration Ratio</span>
            <p className="text-2xl font-bold text-white tracking-tight mt-1">{data?.aiPercentage ? `${data.aiPercentage.toFixed(1)}%` : '0%'}</p>
          </div>
          <Sparkles className="h-8 w-8 text-blue-500 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">AI Inference Cost Est.</span>
            <p className="text-2xl font-bold text-white tracking-tight mt-1">$0.00</p>
          </div>
          <Sparkles className="h-8 w-8 text-emerald-500 opacity-60" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-500" /> AI Project Generation Trend
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.growthTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
              <Area type="monotone" dataKey="projects" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="AI Generated Projects" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAiUsage;
