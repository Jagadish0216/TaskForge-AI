import { useState, useEffect } from 'react';
import { adminService } from '../services/services';
import { FileText, Download, Printer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reportType, setReportType] = useState('user');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch datasets based on report type
      if (reportType === 'user') {
        const res = await adminService.getUsers();
        const data = res.data || res;
        setReportData(data.map(u => ({
          ID: u.id,
          Name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          Email: u.email,
          Role: u.roles?.[0]?.name?.replace('ROLE_', '') || 'TEAM_MEMBER',
          Status: u.enabled ? 'Active' : 'Blocked',
          RegisteredAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
        })));
      } else if (reportType === 'project') {
        const res = await adminService.getProjects();
        const data = res.data || res;
        setReportData(data.map(p => ({
          ID: p.id,
          Name: p.name,
          Key: p.projectKey,
          Owner: p.owner?.email || 'System',
          Status: p.status,
          Priority: p.priority,
          Visibility: p.visibility,
          Archived: p.archived ? 'Yes' : 'No',
          AI_Generated: p.aiGenerated ? 'Yes' : 'No'
        })));
      } else if (reportType === 'task') {
        const res = await adminService.getTasks();
        const data = res.data || res;
        setReportData(data.map(t => ({
          ID: t.id,
          Title: t.title,
          Project: t.project?.name || 'N/A',
          Assignee: t.assignee?.email || 'Unassigned',
          Status: t.status,
          Priority: t.priority,
          DueDate: t.dueDate || 'N/A'
        })));
      } else if (reportType === 'ai_usage') {
        const res = await adminService.getProjects();
        const data = res.data || res;
        const aiProjects = data.filter(p => p.aiGenerated);
        setReportData(aiProjects.map(p => ({
          Project_ID: p.id,
          Project_Name: p.name,
          Project_Key: p.projectKey,
          Owner: p.owner?.email || 'System',
          Prompt_Topic: p.description?.substring(0, 50) || 'AI Generated',
          Created_Date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
        })));
      } else if (reportType === 'completion') {
        const res = await adminService.getTasks();
        const data = res.data || res;
        const completed = data.filter(t => t.status === 'DONE');
        setReportData(completed.map(t => ({
          Task_ID: t.id,
          Task_Title: t.title,
          Project: t.project?.name || 'N/A',
          Completed_By: t.assignee?.email || 'Unassigned',
          Due_Date: t.dueDate || 'N/A',
          Completed_Date: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'N/A'
        })));
      }
      toast.success('Report generated successfully.');
    } catch (err) {
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(reportData[0]);
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map(header => {
        const val = row[header];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success('CSV Export Completed');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Selection</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded px-3 py-2 focus:border-blue-600 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="user">User Directory Report</option>
            <option value="project">Project Inventory Report</option>
            <option value="task">Global Task Inventory</option>
            <option value="ai_usage">AI Usage Summary</option>
            <option value="completion">Task Completion Summary</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={reportData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          
          <button
            onClick={handlePrintPDF}
            disabled={reportData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> PDF / Print
          </button>
        </div>
      </div>

      {/* Generated Report Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : reportData.length > 0 ? (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-4 text-center">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {reportType.replace('_', ' ')} Report
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">
                Generated on: {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-350">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    {Object.keys(reportData[0]).map((header) => (
                      <th key={header} className="py-3 px-4">{header.replace('_', ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="py-3 px-4 font-medium text-slate-300">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No record data available to compile.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
