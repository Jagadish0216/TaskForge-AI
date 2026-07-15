import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Plus,
  Send,
  Copy,
  Download,
  FolderKanban,
  ShieldAlert,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { aiService, projectService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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

export const AiWorkspace = () => {
  const navigate = useNavigate();

  // Project & Context
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat Conversations
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Project Assistant Chat', timestamp: 'Active Session' },
  ]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your TaskForge AI Assistant powered by Google Gemini. Select an active project or ask me any question about your tasks, sprint backlog, or architecture.',
    },
  ]);
  const [inputChat, setInputChat] = useState('');

  // Structured Result Modals / Cards
  const [createdProject, setCreatedProject] = useState(null);
  const [structuredOutput, setStructuredOutput] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(list[0].id));
      }
    } catch (err) {
      setProjects([]);
    }
  };

  const startNewChat = () => {
    const newId = Date.now();
    setConversations((prev) => [
      { id: newId, title: `New Assistant Session`, timestamp: 'Just now' },
      ...prev,
    ]);
    setActiveConvId(newId);
    setChatMessages([
      {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Started a new session. How can I help you manage your projects today?',
      },
    ]);
    setStructuredOutput(null);
    setCreatedProject(null);
  };

  const handleSendMessage = async (customMessage) => {
    const text = customMessage || inputChat;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputChat('');
    setLoading(true);

    try {
      const pId = selectedProjectId ? Number(selectedProjectId) : null;
      const res = await aiService.chat(text, pId);
      const reply = getAIContent(res);
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gemini AI failed to respond');
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTED ACTION 1: Generate Project
  const handleActionGenerateProject = async () => {
    const promptText = prompt('Enter a description for the new project to generate:', 'Build a Hospital Management System');
    if (!promptText || !promptText.trim()) return;

    setLoading(true);
    setCreatedProject(null);
    setStructuredOutput(null);

    const userMsg = { id: Date.now(), sender: 'user', text: `Action: Generate Project for "${promptText}"` };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await aiService.generateProject(promptText.trim());
      const proj = res.data || res;
      setCreatedProject(proj);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Project "${proj.name || 'New Project'}" has been generated and saved into MySQL with key ${proj.projectKey || proj.key}.`,
        },
      ]);
      toast.success(`Project created in database!`);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate project');
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTED ACTION 2: Plan Sprint
  const handleActionPlanSprint = async () => {
    if (!selectedProjectId) {
      toast.error('Please select an active context project first');
      return;
    }
    const sprintGoal = prompt('Enter sprint focus / goal (optional):', 'Complete core REST API endpoints and database setup');
    setLoading(true);
    setStructuredOutput(null);

    const userMsg = { id: Date.now(), sender: 'user', text: `Action: Generate Sprint Plan for project` };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await aiService.planSprint(Number(selectedProjectId), sprintGoal || '');
      const content = getAIContent(res);
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { text: content };
      }
      setStructuredOutput({ type: 'SPRINT', data: parsed });
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: content },
      ]);
      toast.success('Sprint plan compiled from project backlog!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sprint planning failed');
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTED ACTION 3: Analyze Risks
  const handleActionAnalyzeRisks = async () => {
    if (!selectedProjectId) {
      toast.error('Please select an active context project first');
      return;
    }
    setLoading(true);
    setStructuredOutput(null);

    const userMsg = { id: Date.now(), sender: 'user', text: `Action: Analyze Project Risks & Health Audit` };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await aiService.analyzeRisks(Number(selectedProjectId));
      const content = getAIContent(res);
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { text: content };
      }
      setStructuredOutput({ type: 'RISK', data: parsed });
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: content },
      ]);
      toast.success('Project risk evaluation completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Risk analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTED ACTION 4: Generate Documentation
  const handleActionGenerateDocs = async () => {
    if (!selectedProjectId) {
      toast.error('Please select an active context project first');
      return;
    }
    const docType = prompt('Enter document type (README, API_DOCS, TECHNICAL_SPEC):', 'README');
    if (!docType) return;

    setLoading(true);
    setStructuredOutput(null);

    const userMsg = { id: Date.now(), sender: 'user', text: `Action: Generate ${docType} Documentation` };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await aiService.generateDocumentation(Number(selectedProjectId), docType);
      const markdown = getAIContent(res);
      setStructuredOutput({ type: 'DOCS', data: { docType, markdown } });
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: markdown },
      ]);
      toast.success(`${docType} documentation generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Documentation generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-sans shadow-lg">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>

          {/* Context Project Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
              Active Context Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {projects.length === 0 ? (
                <option value="">No Active Projects</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectKey || p.key || 'PROJ'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block px-1">
              Conversations
            </span>
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-none">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                    activeConvId === conv.id
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">{conv.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] space-y-1 text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Google Gemini Engine
          </div>
          <p>Real-time database context integration</p>
        </div>
      </aside>

      {/* CENTER CONVERSATION AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
        {/* Top Header */}
        <header className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              TaskForge AI Co-Pilot
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">
              Active Project:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {selectedProjectId
                  ? projects.find((p) => String(p.id) === String(selectedProjectId))?.name || 'Selected'
                  : 'Global Workspace'}
              </strong>
            </span>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs scrollbar-none">
          {/* Welcome Screen Suggestions */}
          {chatMessages.length <= 1 && (
            <div className="my-6 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> Suggested Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleActionGenerateProject}
                  className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                    <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Generate Project</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                  <p className="text-[11px] text-slate-500">Auto-create project & tasks in MySQL</p>
                </button>

                <button
                  onClick={handleActionPlanSprint}
                  className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                    <span className="flex items-center gap-1.5"><FolderKanban className="w-4 h-4 text-blue-500" /> Plan Sprint</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                  <p className="text-[11px] text-slate-500">Allocate backlog tasks into sprint goal</p>
                </button>

                <button
                  onClick={handleActionAnalyzeRisks}
                  className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                    <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-500" /> Analyze Risks</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                  <p className="text-[11px] text-slate-500">Evaluate overdue tasks & health score</p>
                </button>

                <button
                  onClick={handleActionGenerateDocs}
                  className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-500" /> Generate Docs</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                  <p className="text-[11px] text-slate-500">Compile Markdown README or specs</p>
                </button>
              </div>
            </div>
          )}

          {/* Messages list */}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[11px] ${
                  msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <Bot className="w-3.5 h-3.5 text-blue-400" />}
              </div>

              <div
                className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                {msg.text}
                {msg.sender === 'ai' && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 text-slate-400">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="hover:text-blue-500 flex items-center gap-1 text-[10px]"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <LoadingSpinner />}

          {/* Structured Output Cards */}
          {createdProject && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Project Created in MySQL Database
                </span>
                <button
                  onClick={() => navigate(`/projects/${createdProject.id}`)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  View Project <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{createdProject.description}</p>
            </div>
          )}

          {structuredOutput?.type === 'DOCS' && (
            <div className="p-4 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs">{structuredOutput.data.docType}.md</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(structuredOutput.data.markdown)}
                    className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() => downloadMarkdown(structuredOutput.data.markdown, `${structuredOutput.data.docType.toLowerCase()}.md`)}
                    className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download .md
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto text-slate-300">
                {structuredOutput.data.markdown}
              </pre>
            </div>
          )}
        </div>

        {/* BOTTOM INPUT BAR */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Gemini about project status, tasks, or request a quick action..."
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-3 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputChat.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiWorkspace;
