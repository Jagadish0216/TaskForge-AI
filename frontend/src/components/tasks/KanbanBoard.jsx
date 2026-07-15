import TaskCard from './TaskCard';
import { TASK_STATUSES } from '../../utils/constants';

export const KanbanBoard = ({ tasks, onEditTask, onDeleteTask, onStatusChange }) => {
  const columns = [
    { key: 'TODO', title: 'To Do', color: 'border-slate-400 dark:border-slate-600 bg-slate-100/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-500 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
    { key: 'IN_REVIEW', title: 'In Review', color: 'border-amber-500 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
    { key: 'DONE', title: 'Done', color: 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
  ];

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const columnTasks = safeTasks.filter((t) => t && t.status === col.key);

        return (
          <div
            key={col.key}
            className="bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800/80 min-h-[480px] flex flex-col"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0].replace('border', 'bg')}`} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{col.title}</h3>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 scrollbar-none">
              {columnTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl my-2">
                  No tasks in {col.title}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div key={task.id} className="relative group/kanban">
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                    {/* Quick status selector */}
                    {onStatusChange && (
                      <div className="mt-1 flex items-center justify-end gap-1 px-1">
                        <select
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value)}
                          className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-0.5 focus:outline-none"
                        >
                          {Object.keys(TASK_STATUSES).map((sKey) => (
                            <option key={sKey} value={sKey}>
                              Move to: {TASK_STATUSES[sKey].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
