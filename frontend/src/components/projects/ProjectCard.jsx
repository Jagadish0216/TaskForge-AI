import { useNavigate } from 'react-router-dom';
import { Folder, Archive, RotateCcw, Trash2, Edit, Users, ArrowRight, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ProjectCard = ({ project, onEdit, onArchive, onRestore, onDelete }) => {
  const navigate = useNavigate();

  if (!project) return null;

  const key = project.projectKey || project.key || 'PROJ';
  const name = project.name || 'Untitled Project';
  const status = project.status || 'IN_PROGRESS';
  const priority = project.priority || 'MEDIUM';
  const description = project.description || 'No project description provided.';

  return (
    <Card className="flex flex-col justify-between group h-full relative overflow-hidden p-0 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-xl transition-all duration-200">
      {/* Cover Color Strip */}
      <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded uppercase border border-slate-200 dark:border-slate-700">
                    {key}
                  </span>
                  {project.archived && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                      ARCHIVED
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> 94% Health
                  </span>
                </div>
                <h3
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mt-1 text-sm line-clamp-1"
                >
                  {name}
                </h3>
              </div>
            </div>

            <Badge type="projectStatus" value={status} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-[11px] font-mono font-bold text-slate-500">
            <span>Overall Progress</span>
            <span className="text-blue-500">78%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[78%]" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Badge type="priority" value={priority} />
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5" />
              {project.membersCount || 1} member{project.membersCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                title="Edit Project"
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}

            {project.archived ? (
              onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(project.id);
                  }}
                  title="Restore Project"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(project.id);
                  }}
                  title="Archive Project"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                title="Delete Project"
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => navigate(`/projects/${project.id}`)}
              title="Open Details"
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
