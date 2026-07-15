import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Folder, CheckSquare, Users, ArrowRight, Filter } from 'lucide-react';
import { searchService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || searchParams.get('query') || '';

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState({ projects: [], tasks: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PROJECTS, TASKS, USERS

  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await searchService.globalSearch(q);
      const data = res.data || res || {};
      setResults({
        projects: Array.isArray(data.projects) ? data.projects : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        users: Array.isArray(data.users) ? data.users : [],
      });
    } catch (err) {
      setResults({ projects: [], tasks: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  const totalResults = results.projects.length + results.tasks.length + results.users.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search Bar Input */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Global Workspace Search
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search across projects, task records, comments, and team members
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Type keyword, project name, task title, or team member..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full pl-12 pr-28 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'ALL', label: `All Results (${totalResults})` },
          { key: 'PROJECTS', label: `Projects (${results.projects.length})`, icon: Folder },
          { key: 'TASKS', label: `Tasks (${results.tasks.length})`, icon: CheckSquare },
          { key: 'USERS', label: `Team Members (${results.users.length})`, icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : totalResults === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No matching results found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We couldn't find anything matching "{query}". Try checking for spelling errors or searching with a different keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Projects Group */}
          {(activeTab === 'ALL' || activeTab === 'PROJECTS') && results.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Folder className="w-4 h-4 text-blue-600" /> Projects ({results.projects.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.projects.map((p) => (
                  <Card
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="cursor-pointer hover:border-blue-500/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded uppercase">
                          {p.projectKey || p.key}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-blue-600">
                          {p.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {p.description || 'No description'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Group */}
          {(activeTab === 'ALL' || activeTab === 'TASKS') && results.tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <CheckSquare className="w-4 h-4 text-blue-600" /> Tasks ({results.tasks.length})
              </div>
              <div className="space-y-2">
                {results.tasks.map((t) => (
                  <Card
                    key={t.id}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                    className="cursor-pointer hover:border-blue-500/50 transition-all flex items-center justify-between p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-slate-400">#{t.id}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight hover:text-blue-600">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {t.description || 'No task description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="priority" value={t.priority} />
                      <Badge type="status" value={t.status} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users Group */}
          {(activeTab === 'ALL' || activeTab === 'USERS') && results.users.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 text-blue-600" /> Team Members ({results.users.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.users.map((u) => (
                  <Card key={u.id} className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                      </p>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
