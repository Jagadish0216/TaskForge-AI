import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  Copy,
  Download,
  FolderKanban,
  ShieldAlert,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  MessageSquare,
  Plus,
  AlertTriangle,
  TrendingUp,
  Target,
  Activity,
  ChevronRight,
  ExternalLink,
  Clock,
  Shield,
  BookOpen,
  Terminal,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  Layers,
  Kanban,
  Code,
  Check,
} from 'lucide-react';
import { aiService, projectService, taskService } from '../services/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

/* ─── Response content extractor ─── */
export const getAIContent = (response) => {
  if (response === null || response === undefined) return '';
  if (typeof response === 'string') return response;
  if (typeof response === 'number' || typeof response === 'boolean') return String(response);

  const payload = response.data ?? response;
  if (typeof payload === 'string') return payload;

  if (payload && typeof payload === 'object') {
    if (typeof payload.generatedContent === 'string') return payload.generatedContent;
    if (typeof payload.response === 'string') return payload.response;
    if (typeof payload.data === 'string') return payload.data;
    if (payload.data && typeof payload.data.generatedContent === 'string') return payload.data.generatedContent;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return 'Unable to format response content';
  }
};

/* ─── Helper to safely parse AI JSON output ─── */
const parseAIJson = (content) => {
  if (!content) return null;
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { text: content };
  }
};

/* ─── Module Tabs ─── */
const MODULES = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'risk', label: 'Risk Radar', icon: ShieldAlert },
  { id: 'sprint', label: 'Sprint Planner', icon: FolderKanban },
  { id: 'docs', label: 'Docs Hub', icon: FileText },
  { id: 'assistant', label: 'Assistant', icon: MessageSquare },
];

const DOC_TYPES = ['README', 'API_DOCS', 'SPEC', 'ARCHITECTURE'];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AI MISSION CONTROL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const AiWorkspace = () => {
  const navigate = useNavigate();

  /* ─── Global State ─── */
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeModule, setActiveModule] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [operationLabel, setOperationLabel] = useState('');

  /* ─── Project task summary for overview ─── */
  const [projectTasks, setProjectTasks] = useState([]);

  /* ─── Module Results ─── */
  const [riskResult, setRiskResult] = useState(null);
  const [showRawRisk, setShowRawRisk] = useState(false);

  const [sprintResult, setSprintResult] = useState(null);
  const [sprintGoal, setSprintGoal] = useState('');
  const [selectedTaskIndices, setSelectedTaskIndices] = useState([]);
  const [showSprintConfirmModal, setShowSprintConfirmModal] = useState(false);
  const [creationProgress, setCreationProgress] = useState(null); // { isCreating, total, succeededCount, failedCount, failedItems }
  const [persistedTaskTitles, setPersistedTaskTitles] = useState(new Set());
  const [showRawSprint, setShowRawSprint] = useState(false);

  const [docsResult, setDocsResult] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('README');

  /* ─── Chat (Assistant) ─── */
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'AI Assistant ready. Select a project context and ask about tasks, status, or request any operation.',
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const chatEndRef = useRef(null);

  /* ─── Project Generator Modal ─── */
  const [createdProject, setCreatedProject] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    projectName: '',
    prompt: '',
    priority: 'MEDIUM',
    projectPhase: 'Planning',
    estimatedTeamSize: '1-5',
    deadline: '',
    technologyStack: '',
  });

  /* ─── Fetch projects on mount ─── */
  useEffect(() => {
    fetchProjects();
  }, []);

  /* ─── Fetch project tasks when project changes ─── */
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectTasks();
    } else {
      setProjectTasks([]);
    }
  }, [selectedProjectId]);

  /* ─── Auto-scroll chat ─── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(list[0].id));
      }
    } catch {
      setProjects([]);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const res = await taskService.getTasks({ projectId: Number(selectedProjectId) }, { size: 200 });
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setProjectTasks(list);
    } catch {
      setProjectTasks([]);
    }
  };

  const selectedProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  /* ─── Computed project stats ─── */
  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length;
  const overdueTasks = projectTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  ).length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /* ━━━━ ACTION HANDLERS ━━━━ */

  const handleAnalyzeRisks = async () => {
    if (!selectedProjectId) {
      toast.error('Select a project context first');
      return;
    }
    setLoading(true);
    setOperationLabel('Analyzing project risks…');
    setRiskResult(null);
    setShowRawRisk(false);
    try {
      const res = await aiService.analyzeRisks(Number(selectedProjectId));
      const content = getAIContent(res);
      const parsed = parseAIJson(content);
      setRiskResult(parsed);
      toast.success('Risk analysis complete');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Risk analysis failed');
    } finally {
      setLoading(false);
      setOperationLabel('');
    }
  };

  const handlePlanSprint = async () => {
    if (!selectedProjectId) {
      toast.error('Select a project context first');
      return;
    }
    setLoading(true);
    setOperationLabel('Generating sprint plan…');
    setSprintResult(null);
    setSelectedTaskIndices([]);
    setCreationProgress(null);
    setShowRawSprint(false);
    try {
      const res = await aiService.planSprint(Number(selectedProjectId), sprintGoal || '');
      const content = getAIContent(res);
      const parsed = parseAIJson(content);
      setSprintResult(parsed);

      const tasks = parsed?.sprintTasks || parsed?.tasks || parsed?.items || [];
      if (Array.isArray(tasks)) {
        setSelectedTaskIndices(tasks.map((_, i) => i));
      }
      toast.success('Sprint plan generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sprint planning failed');
    } finally {
      setLoading(false);
      setOperationLabel('');
    }
  };

  const handleCreateSelectedTasks = async (tasksToCreate) => {
    const targetProject = selectedProject;
    if (!targetProject) {
      toast.error('No project context selected');
      return;
    }

    setCreationProgress({
      isCreating: true,
      total: tasksToCreate.length,
      succeededCount: 0,
      failedCount: 0,
      failedItems: [],
    });

    let succeeded = 0;
    let failed = 0;
    const failedItems = [];
    const newPersistedTitles = new Set(persistedTaskTitles);

    for (const item of tasksToCreate) {
      const taskPayload = {
        title: item.title || 'AI Sprint Task',
        description: item.reasoning ? `[AI Sprint Allocation] ${item.reasoning}` : (item.description || ''),
        status: 'BACKLOG',
        priority: (item.priority || 'MEDIUM').toUpperCase(),
        projectId: Number(targetProject.id),
        estimatedHours: item.estimatedHours ? Number(item.estimatedHours) : 8,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      };

      try {
        await taskService.createTask(taskPayload);
        succeeded++;
        newPersistedTitles.add(item.title);
      } catch (err) {
        failed++;
        failedItems.push({ task: item, error: err.response?.data?.message || 'Failed to create task' });
      }

      setCreationProgress({
        isCreating: true,
        total: tasksToCreate.length,
        succeededCount: succeeded,
        failedCount: failed,
        failedItems,
      });
    }

    setPersistedTaskTitles(newPersistedTitles);

    setCreationProgress({
      isCreating: false,
      total: tasksToCreate.length,
      succeededCount: succeeded,
      failedCount: failed,
      failedItems,
    });

    fetchProjectTasks();

    if (failed === 0) {
      toast.success(`${succeeded} task${succeeded !== 1 ? 's' : ''} created in Backlog!`);
    } else if (succeeded > 0) {
      toast.error(`${succeeded} task${succeeded !== 1 ? 's' : ''} created, ${failed} failed`);
    } else {
      toast.error('Failed to create tasks');
    }
  };

  const handleGenerateDocs = async () => {
    if (!selectedProjectId) {
      toast.error('Select a project context first');
      return;
    }
    setLoading(true);
    setOperationLabel(`Generating ${selectedDocType} documentation…`);
    setDocsResult(null);
    try {
      const res = await aiService.generateDocumentation(Number(selectedProjectId), selectedDocType);
      const markdown = getAIContent(res);
      setDocsResult({ docType: selectedDocType, markdown });
      toast.success(`${selectedDocType} documentation generated`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Documentation generation failed');
    } finally {
      setLoading(false);
      setOperationLabel('');
    }
  };

  const handleSendMessage = async (customMessage) => {
    const text = customMessage || inputChat;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputChat('');
    setLoading(true);
    setOperationLabel('Thinking…');

    try {
      const pId = selectedProjectId ? Number(selectedProjectId) : null;
      const res = await aiService.chat(text, pId);
      const reply = getAIContent(res);
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI failed to respond');
    } finally {
      setLoading(false);
      setOperationLabel('');
    }
  };

  const handleSubmitGenerateProject = async (e) => {
    e.preventDefault();
    if (!generateForm.projectName.trim() || !generateForm.prompt.trim()) {
      toast.error('Project Name and Description are required');
      return;
    }
    setShowGenerateModal(false);
    setLoading(true);
    setOperationLabel('Generating project structure…');
    setCreatedProject(null);
    try {
      const res = await aiService.generateProject(generateForm);
      const proj = res.data || res;
      setCreatedProject(proj);
      toast.success(`Project "${proj.name || 'New Project'}" created in database`);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate project');
    } finally {
      setLoading(false);
      setOperationLabel('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadMarkdown = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    toast.success(`Downloaded ${filename}`);
  };

  /* ━━━━ RENDERING HELPERS ━━━━ */

  const renderStructuredText = (data) => {
    if (!data) return null;
    const text = typeof data === 'string' ? data : data.text || JSON.stringify(data, null, 2);
    return (
      <div className="relative">
        <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 max-h-[60vh] overflow-y-auto scrollbar-none p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          {text}
        </pre>
        <button
          onClick={() => copyToClipboard(text)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-cyan-600 transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  /* ─── 1. RISK RADAR RENDERER ─── */
  const renderRiskPanels = (result) => {
    if (!result) return null;

    const healthScore = result.healthScore ?? result.health_score ?? result.score;
    const risks = result.risks || result.risk_items || result.items;
    const recommendations = result.recommendations || result.recommendation_list;
    const summary = result.summary || result.overview || result.text;

    const isStructured = healthScore !== undefined || (Array.isArray(risks) && risks.length > 0);

    if (!isStructured && summary) {
      return renderStructuredText(summary);
    }

    return (
      <div className="space-y-4">
        {/* Health Score Summary Card */}
        {healthScore !== undefined && (
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-xs ${
                  Number(healthScore) >= 80
                    ? 'bg-emerald-500'
                    : Number(healthScore) >= 60
                    ? 'bg-amber-500'
                    : Number(healthScore) >= 40
                    ? 'bg-orange-500'
                    : 'bg-rose-500'
                }`}
              >
                {healthScore}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Project Health Score
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {Number(healthScore) >= 80
                    ? 'Healthy Platform'
                    : Number(healthScore) >= 60
                    ? 'Needs Attention'
                    : Number(healthScore) >= 40
                    ? 'At Risk'
                    : 'Critical Vulnerabilities'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Based on overdue tasks, priority density, and task completion ratios
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRawRisk(!showRawRisk)}
              className="px-2.5 py-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md flex items-center gap-1 transition-colors"
            >
              <Code className="w-3 h-3" /> {showRawRisk ? 'Hide Raw' : 'View raw response'}
            </button>
          </div>
        )}

        {/* Raw Response Toggle View */}
        {showRawRisk && renderStructuredText(result)}

        {/* Structured Risk Cards */}
        {Array.isArray(risks) && risks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-1">
              Identified Risk Vectors ({risks.length})
            </h4>
            {risks.map((risk, i) => {
              const level = (risk.level || risk.severity || 'MEDIUM').toUpperCase();
              const issue = risk.issue || risk.title || risk.name || (typeof risk === 'string' ? risk : `Risk Item ${i + 1}`);
              const impact = risk.impact || risk.description || risk.detail || '';
              const recommendation = risk.recommendation || risk.mitigation || '';
              const affectedTask = risk.affectedTask || risk.affected_task || risk.task || '';

              const isHigh = level === 'HIGH' || level === 'CRITICAL' || level === 'URGENT';
              const isMedium = level === 'MEDIUM';

              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg border bg-white dark:bg-slate-900 transition-all ${
                    isHigh
                      ? 'border-rose-200 dark:border-rose-900/60'
                      : isMedium
                      ? 'border-amber-200 dark:border-amber-900/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{issue}</div>
                        {impact && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Why it matters: </span>
                            {impact}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                        isHigh
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : isMedium
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {level}
                    </span>
                  </div>

                  {affectedTask && (
                    <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Affected:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                        {affectedTask}
                      </span>
                    </div>
                  )}

                  {recommendation && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-cyan-700 dark:text-cyan-400 flex items-start gap-1.5">
                      <Target className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">Recommendation: </span>
                        {recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actionable Mitigation Recommendations */}
        {Array.isArray(recommendations) && recommendations.length > 0 && (
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-500" /> Actionable Mitigation Steps
            </h4>
            <ul className="space-y-1.5">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-500 font-bold shrink-0">•</span>
                  <span>{typeof rec === 'string' ? rec : rec.action || rec.title || JSON.stringify(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  /* ─── 2. SPRINT PLANNER RENDERER ─── */
  const renderSprintPlan = (result) => {
    if (!result) return null;

    const goal = result.sprintGoal || result.goal || sprintGoal;
    const storyPoints = result.storyPoints || result.story_points || result.totalStoryPoints;
    const sprintTasks = result.sprintTasks || result.tasks || result.sprint_tasks || result.items;
    const risks = result.risks;
    const recommendations = result.recommendations;

    const isStructured = Array.isArray(sprintTasks);

    if (!isStructured) {
      return renderStructuredText(result);
    }

    const totalHours = sprintTasks.reduce(
      (acc, t) => acc + (t.estimatedHours ? Number(t.estimatedHours) : 0),
      0
    );

    const selectedCount = selectedTaskIndices.length;
    const allSelected = selectedCount === sprintTasks.length && sprintTasks.length > 0;

    const toggleSelectAll = () => {
      if (allSelected) {
        setSelectedTaskIndices([]);
      } else {
        setSelectedTaskIndices(sprintTasks.map((_, i) => i));
      }
    };

    const toggleTaskSelection = (index) => {
      setSelectedTaskIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    };

    return (
      <div className="space-y-4">
        {/* Sprint Summary Card */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Sprint Objective
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {goal || 'Sprint Backlog Allocation'}
              </div>
            </div>

            <button
              onClick={() => setShowRawSprint(!showRawSprint)}
              className="px-2.5 py-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md flex items-center gap-1 transition-colors shrink-0"
            >
              <Code className="w-3 h-3" /> {showRawSprint ? 'Hide Raw' : 'View raw response'}
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">{sprintTasks.length}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-0.5">Suggested Tasks</div>
            </div>
            <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
              <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">{totalHours > 0 ? `${totalHours}h` : '--'}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-0.5">Total Estimated Effort</div>
            </div>
            <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{storyPoints ? `${storyPoints} pts` : `${sprintTasks.length * 3} pts`}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-0.5">Capacity Estimate</div>
            </div>
          </div>
        </div>

        {/* Raw Response Toggle View */}
        {showRawSprint && renderStructuredText(result)}

        {/* Sprint Tasks Selection Controls Bar */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 flex items-center gap-1.5"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-cyan-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              Select All ({sprintTasks.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
              {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              disabled={selectedCount === 0}
              onClick={() => setShowSprintConfirmModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Kanban className="w-3.5 h-3.5" /> Review Selected Tasks
            </button>
          </div>
        </div>

        {/* Structured Task Cards */}
        <div className="space-y-2.5">
          {sprintTasks.map((task, i) => {
            const isSelected = selectedTaskIndices.includes(i);
            const isPersisted = persistedTaskTitles.has(task.title);
            const priority = (task.priority || 'MEDIUM').toUpperCase();
            const est = task.estimatedHours || task.estimated_hours || task.hours;

            return (
              <div
                key={i}
                onClick={() => toggleTaskSelection(i)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isPersisted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : isSelected
                    ? 'bg-cyan-50/30 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* State Badge */}
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        AI SUGGESTED
                      </span>

                      {isSelected && !isPersisted && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          USER SELECTED
                        </span>
                      )}

                      {isPersisted && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> PERSISTED IN BACKLOG
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          priority === 'CRITICAL' || priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                            : priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {priority}
                      </span>

                      {est && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-400" /> {est}h
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</div>

                    {task.reasoning && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Reasoning: </span>
                        {task.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Sprint Insights */}
        {Array.isArray(risks) && risks.length > 0 && (
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Sprint Risk Considerations
            </div>
            <ul className="space-y-1">
              {risks.map((r, i) => (
                <li key={i} className="text-xs text-amber-800 dark:text-amber-300">
                  • {typeof r === 'string' ? r : JSON.stringify(r)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODULE RENDERERS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /* ─── OVERVIEW MODULE ─── */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Context Summary */}
      {selectedProject && (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded">
                {selectedProject.projectKey || selectedProject.key || 'PROJ'}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedProject.name}</span>
            </div>
            <button
              onClick={() => navigate(`/projects/${selectedProject.id}`)}
              className="text-[10px] font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              Open Workspace <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Completion', value: `${completionPct}%`, sub: `${doneTasks}/${totalTasks}`, color: completionPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : completionPct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400' },
              { label: 'Active Backlog', value: totalTasks - doneTasks, sub: 'tasks remaining', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Overdue', value: overdueTasks, sub: 'past due date', color: overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400' },
              { label: 'Total Tasks', value: totalTasks, sub: 'in project', color: 'text-slate-600 dark:text-slate-400' },
            ].map((m) => (
              <div key={m.label} className="text-center p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
                <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-0.5">{m.label}</div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedProject && (
        <div className="p-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <Terminal className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Select a project to provide AI context</p>
        </div>
      )}

      {/* Created Project Success Banner */}
      {createdProject && (
        <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Project "{createdProject.name || 'New Project'}" created in database
            </span>
          </div>
          <button
            onClick={() => navigate(`/projects/${createdProject.id}`)}
            className="px-3 py-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition-colors"
          >
            Open <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick Action Cards */}
      <div>
        <h3 className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">
          AI Operations
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Zap,
              label: 'Generate Project',
              desc: 'Create project + tasks in database',
              color: 'text-amber-500',
              borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
              action: () => setShowGenerateModal(true),
              requiresProject: false,
            },
            {
              icon: ShieldAlert,
              label: 'Risk Radar',
              desc: 'Health score + risk assessment',
              color: 'text-rose-500',
              borderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
              action: () => { setActiveModule('risk'); handleAnalyzeRisks(); },
              requiresProject: true,
            },
            {
              icon: FolderKanban,
              label: 'Sprint Planner',
              desc: 'Allocate backlog into sprint',
              color: 'text-blue-500',
              borderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
              action: () => setActiveModule('sprint'),
              requiresProject: true,
            },
            {
              icon: FileText,
              label: 'Generate Docs',
              desc: 'README, API docs, specs',
              color: 'text-emerald-500',
              borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
              action: () => setActiveModule('docs'),
              requiresProject: true,
            },
          ].map((card) => (
            <button
              key={card.label}
              onClick={() => {
                if (card.requiresProject && !selectedProjectId) {
                  toast.error('Select a project context first');
                  return;
                }
                card.action();
              }}
              className={`p-4 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${card.borderHover} transition-all group`}
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{card.label}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent results summary */}
      {(riskResult || sprintResult || docsResult) && (
        <div>
          <h3 className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">
            Recent Results
          </h3>
          <div className="space-y-2">
            {riskResult && (
              <button
                onClick={() => setActiveModule('risk')}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors"
              >
                <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Risk Analysis</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">View latest risk evaluation</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
            {sprintResult && (
              <button
                onClick={() => setActiveModule('sprint')}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors"
              >
                <FolderKanban className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Sprint Plan</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">View latest sprint allocation</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
            {docsResult && (
              <button
                onClick={() => setActiveModule('docs')}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{docsResult.docType} Documentation</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">View generated document</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ─── RISK RADAR MODULE ─── */
  const renderRiskRadar = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Risk Radar</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            AI evaluates overdue tasks, priority density, and completion health from database context
          </p>
        </div>
        <button
          onClick={handleAnalyzeRisks}
          disabled={loading || !selectedProjectId}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {loading && activeModule === 'risk' ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
          ) : (
            <><ShieldAlert className="w-3.5 h-3.5" /> Run Analysis</>
          )}
        </button>
      </div>

      {loading && activeModule === 'risk' && (
        <div className="py-12 flex flex-col items-center gap-3">
          <LoadingSpinner />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{operationLabel}</span>
        </div>
      )}

      {!loading && riskResult && renderRiskPanels(riskResult)}

      {!loading && !riskResult && (
        <div className="py-16 text-center">
          <Shield className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click <strong>Run Analysis</strong> to evaluate project health
          </p>
        </div>
      )}
    </div>
  );

  /* ─── SPRINT PLANNER MODULE ─── */
  const renderSprintPlanner = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sprint Planner</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          AI allocates backlog tasks into a structured sprint plan based on database context
        </p>
      </div>

      {/* Sprint Goal Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Sprint goal (optional) — e.g. Focus on backend API security and database migrations"
          value={sprintGoal}
          onChange={(e) => setSprintGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlanSprint()}
          className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400"
        />
        <button
          onClick={handlePlanSprint}
          disabled={loading || !selectedProjectId}
          className="px-4 py-2.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
          {loading && activeModule === 'sprint' ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Planning…</>
          ) : (
            <><FolderKanban className="w-3.5 h-3.5" /> Generate Plan</>
          )}
        </button>
      </div>

      {loading && activeModule === 'sprint' && (
        <div className="py-12 flex flex-col items-center gap-3">
          <LoadingSpinner />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{operationLabel}</span>
        </div>
      )}

      {!loading && sprintResult && renderSprintPlan(sprintResult)}

      {!loading && !sprintResult && (
        <div className="py-16 text-center">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter a sprint goal and click <strong>Generate Plan</strong>
          </p>
        </div>
      )}
    </div>
  );

  /* ─── DOCS HUB MODULE ─── */
  const renderDocsHub = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Documentation Hub</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          AI generates Markdown documentation from project database context
        </p>
      </div>

      {/* Doc Type Selector + Trigger */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt}
              onClick={() => setSelectedDocType(dt)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                selectedDocType === dt
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {dt.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerateDocs}
          disabled={loading || !selectedProjectId}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
          {loading && activeModule === 'docs' ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate</>
          )}
        </button>
      </div>

      {loading && activeModule === 'docs' && (
        <div className="py-12 flex flex-col items-center gap-3">
          <LoadingSpinner />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{operationLabel}</span>
        </div>
      )}

      {!loading && docsResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {docsResult.docType}.md
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(docsResult.markdown)}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={() => downloadMarkdown(docsResult.markdown, `${docsResult.docType.toLowerCase()}.md`)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 max-h-[60vh] overflow-y-auto scrollbar-none p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            {docsResult.markdown}
          </pre>
        </div>
      )}

      {!loading && !docsResult && (
        <div className="py-16 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a document type and click <strong>Generate</strong>
          </p>
        </div>
      )}
    </div>
  );

  /* ─── ASSISTANT (CHAT) MODULE ─── */
  const renderAssistant = () => (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                msg.sender === 'user' ? 'bg-slate-700' : 'bg-cyan-700 border border-cyan-600'
              }`}
            >
              {msg.sender === 'user' ? 'U' : <Bot className="w-3 h-3 text-cyan-200" />}
            </div>

            <div
              className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap text-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-slate-100 rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
              }`}
            >
              {msg.text}
              {msg.sender === 'ai' && (
                <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-[10px] text-slate-400 hover:text-cyan-500 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-2.5 h-2.5" /> Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && activeModule === 'assistant' && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-cyan-700 border border-cyan-600 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-cyan-200" />
            </div>
            <div className="p-3 rounded-xl rounded-tl-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="font-mono">{operationLabel}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about project status, tasks, or request any operation…"
            value={inputChat}
            onChange={(e) => setInputChat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputChat.trim()}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>
    </div>
  );

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MAIN RENDER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const allSprintTasks = sprintResult?.sprintTasks || sprintResult?.tasks || sprintResult?.sprint_tasks || [];
  const selectedTasksList = allSprintTasks.filter((_, i) => selectedTaskIndices.includes(i));

  return (
    <div className="h-[calc(100vh-6rem)] max-w-6xl mx-auto flex flex-col font-sans">
      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between px-1 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">AI Mission Control</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Powered by Google Gemini · Database Context</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 min-w-[180px]"
          >
            {projects.length === 0 ? (
              <option value="">No Projects</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectKey || p.key || 'PROJ'} — {p.name}
                </option>
              ))
            )}
          </select>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* ─── MODULE TAB BAR ─── */}
      <nav className="flex items-center gap-1 px-1 pt-3 pb-0 shrink-0 overflow-x-auto scrollbar-none">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-slate-50 dark:bg-slate-900/50'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mod.label}
            </button>
          );
        })}
      </nav>

      {/* ─── CONTENT AREA ─── */}
      <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4 scrollbar-none">
        {activeModule === 'overview' && renderOverview()}
        {activeModule === 'risk' && renderRiskRadar()}
        {activeModule === 'sprint' && renderSprintPlanner()}
        {activeModule === 'docs' && renderDocsHub()}
        {activeModule === 'assistant' && renderAssistant()}
      </div>

      {/* ─── SPRINT PLANNER APPLY TO KANBAN CONFIRMATION MODAL ─── */}
      {showSprintConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <Kanban className="w-4 h-4 text-cyan-500" /> Apply Sprint Tasks to Backlog
              </h3>
              <button
                onClick={() => setShowSprintConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are about to create <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTasksList.length} task{selectedTasksList.length !== 1 ? 's' : ''}</span> in project:
              </p>
              <div className="p-3 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/30 flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-600 text-white rounded">
                  {selectedProject?.projectKey || 'PROJ'}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject?.name || 'Current Project'}
                </span>
              </div>

              {/* Task Preview List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950">
                {selectedTasksList.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-white dark:bg-slate-900 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{t.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {(t.priority || 'MEDIUM').toUpperCase()}
                      </span>
                      {t.estimatedHours && (
                        <span className="text-slate-400">{t.estimatedHours}h</span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">
                        BACKLOG
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Creation Progress & Partial Failure Display */}
              {creationProgress && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Creation Status:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {creationProgress.succeededCount + creationProgress.failedCount} / {creationProgress.total}
                    </span>
                  </div>

                  {creationProgress.isCreating && (
                    <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating tasks in database…
                    </div>
                  )}

                  {!creationProgress.isCreating && creationProgress.failedCount > 0 && (
                    <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Partial Failure Report:
                      </div>
                      <div>
                        {creationProgress.succeededCount} task{creationProgress.succeededCount !== 1 ? 's' : ''} created,{' '}
                        {creationProgress.failedCount} task{creationProgress.failedCount !== 1 ? 's' : ''} failed.
                      </div>
                      {creationProgress.failedItems.map((fi, idx) => (
                        <div key={idx} className="text-[11px] font-mono text-rose-600 dark:text-rose-400 pl-2">
                          • {fi.task.title}: {fi.error}
                        </div>
                      ))}
                    </div>
                  )}

                  {!creationProgress.isCreating && creationProgress.failedCount === 0 && (
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      All {creationProgress.succeededCount} tasks created successfully in Backlog!
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                {creationProgress && !creationProgress.isCreating && (
                  <button
                    onClick={() => {
                      setShowSprintConfirmModal(false);
                      navigate(`/projects/${selectedProject?.id}`);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Kanban
                  </button>
                )}

                {!creationProgress && <div />}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    disabled={creationProgress?.isCreating}
                    onClick={() => setShowSprintConfirmModal(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                  >
                    {creationProgress?.succeededCount > 0 ? 'Close' : 'Cancel'}
                  </button>

                  {(!creationProgress || creationProgress.failedCount > 0) && (
                    <button
                      disabled={creationProgress?.isCreating}
                      onClick={() => {
                        const itemsToProcess = creationProgress?.failedCount > 0
                          ? creationProgress.failedItems.map((fi) => fi.task)
                          : selectedTasksList;
                        handleCreateSelectedTasks(itemsToProcess);
                      }}
                      className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      {creationProgress?.isCreating ? (
                        <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating…</>
                      ) : creationProgress?.failedCount > 0 ? (
                        <><RefreshCw className="w-3.5 h-3.5" /> Retry Failed Tasks ({creationProgress.failedCount})</>
                      ) : (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Create Tasks</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── GENERATE PROJECT MODAL ─── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> AI Project Generator
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSubmitGenerateProject} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pulse Analytics Platform"
                  value={generateForm.projectName}
                  onChange={(e) => setGenerateForm({ ...generateForm, projectName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Core Goal *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the project scope and objectives…"
                  value={generateForm.prompt}
                  onChange={(e) => setGenerateForm({ ...generateForm, prompt: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={generateForm.priority}
                    onChange={(e) => setGenerateForm({ ...generateForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Phase</label>
                  <input
                    type="text"
                    placeholder="e.g. Planning"
                    value={generateForm.projectPhase}
                    onChange={(e) => setGenerateForm({ ...generateForm, projectPhase: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Team Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 members"
                    value={generateForm.estimatedTeamSize}
                    onChange={(e) => setGenerateForm({ ...generateForm, estimatedTeamSize: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={generateForm.deadline}
                    onChange={(e) => setGenerateForm({ ...generateForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g. React, Spring Boot, MySQL"
                  value={generateForm.technologyStack}
                  onChange={(e) => setGenerateForm({ ...generateForm, technologyStack: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiWorkspace;
