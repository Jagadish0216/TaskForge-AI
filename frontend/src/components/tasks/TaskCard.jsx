import { useDraggable } from '@dnd-kit/core';
import { Calendar, Clock, User, Edit2, Trash2, GripVertical } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, getInitials } from '../../utils/formatters';

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onClick,
  isOverlay = false,
  isDraggable = true,
}) => {
  if (!task) return null;

  // dnd-kit draggable hook (only active when not rendering inside DragOverlay and isDraggable is true)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
    disabled: !isDraggable || isOverlay,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const title = task.title || 'Untitled Task';
  const description = task.description || '';
  const assigneeName = task.assignee
    ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email
    : null;

  const handleCardClick = (e) => {
    // Prevent triggering card click if clicking action buttons
    if (e.defaultPrevented) return;
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={handleCardClick}
      className={`relative group bg-white dark:bg-slate-900 rounded-xl border transition-all duration-150 select-none ${
        isOverlay
          ? 'border-blue-500/60 shadow-2xl ring-2 ring-blue-500/40 rotate-1 cursor-grabbing z-50 p-3.5'
          : isDragging
          ? 'opacity-30 border-dashed border-blue-400/50 bg-blue-50/20 dark:bg-blue-950/20 shadow-none p-3.5'
          : 'border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing p-3.5'
      }`}
    >
      {/* Top Header: Task ID, Drag Handle Icon, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-tight">
            #{task.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {task.priority && <Badge type="priority" value={task.priority} />}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5 leading-snug">
        {title}
      </h4>

      {/* Description Snippet (if available) */}
      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>
      )}

      {/* Footer: Due Date, Effort, Assignee, Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2.5">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              {task.estimatedHours}h
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {assigneeName ? (
            <div
              title={`Assignee: ${assigneeName}`}
              className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[9px] border border-blue-200 dark:border-blue-800"
            >
              {getInitials(assigneeName)}
            </div>
          ) : (
            <div title="Unassigned" className="p-0.5 text-slate-300 dark:text-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
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
