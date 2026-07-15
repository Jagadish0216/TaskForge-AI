import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Edit2, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, getInitials } from '../../utils/formatters';

export const TaskCard = ({ task, onEdit, onDelete }) => {
  const navigate = useNavigate();

  if (!task) return null;

  const title = task.title || 'Untitled Task';
  const description = task.description || 'No description provided.';
  const assigneeName = task.assignee
    ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email
    : null;

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="glass-card bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono font-bold text-slate-400">
            #{task.id}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge type="priority" value={task.priority} />
            <Badge type="status" value={task.status} />
          </div>
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm mb-1.5 leading-snug">
          {title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              {task.estimatedHours}h
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {assigneeName ? (
            <div
              title={`Assignee: ${assigneeName}`}
              className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]"
            >
              {getInitials(assigneeName)}
            </div>
          ) : (
            <div title="Unassigned" className="p-1 text-slate-300 dark:text-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
