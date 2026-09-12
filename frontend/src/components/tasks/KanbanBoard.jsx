import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'BACKLOG', title: 'Backlog', dot: 'bg-slate-400', headerBg: 'bg-slate-100/70 dark:bg-slate-800/60', border: 'border-slate-300 dark:border-slate-700' },
  { key: 'TODO', title: 'To Do', dot: 'bg-blue-400', headerBg: 'bg-slate-100/70 dark:bg-slate-800/60', border: 'border-slate-300 dark:border-slate-700' },
  { key: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-blue-500', headerBg: 'bg-blue-50/70 dark:bg-blue-950/40', border: 'border-blue-300 dark:border-blue-800' },
  { key: 'IN_REVIEW', title: 'In Review', dot: 'bg-amber-500', headerBg: 'bg-amber-50/70 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-800' },
  { key: 'DONE', title: 'Done', dot: 'bg-emerald-500', headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-800' },
];

const DroppableColumn = ({ column, tasks, onTaskClick, onEditTask, onDeleteTask }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.key,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-3 min-h-[500px] transition-colors duration-150 ${
        isOver
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
          : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border ${column.border} ${column.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {column.title}
          </h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
          {tasks.length}
        </span>
      </div>

      {/* Task List / Droppable Area */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {tasks.length === 0 ? (
          <div
            className={`p-6 text-center text-xs font-medium border border-dashed rounded-xl my-2 transition-colors ${
              isOver
                ? 'border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/40'
                : 'border-slate-300/80 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            {isOver ? 'Drop task here' : `No tasks in ${column.title}`}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ tasks = [], onTaskClick, onEditTask, onDeleteTask, onStatusChange }) => {
  const [activeTask, setActiveTask] = useState(null);

  // Configure drag sensors with a 5px activation distance to avoid misinterpreting clicks as drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const handleDragStart = (event) => {
    const taskIdStr = String(event.active.id).replace('task-', '');
    const taskId = Number(taskIdStr);
    const foundTask = safeTasks.find((t) => t.id === taskId);
    if (foundTask) {
      setActiveTask(foundTask);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskIdStr = String(active.id).replace('task-', '');
    const taskId = Number(taskIdStr);
    const targetStatus = over.id; // Target column key (e.g. 'IN_PROGRESS')

    const taskToMove = safeTasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    if (taskToMove.status !== targetStatus && onStatusChange) {
      onStatusChange(taskId, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 pt-1 items-start scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 min-w-full">
        {COLUMNS.map((col) => {
          const columnTasks = safeTasks.filter((t) => t && t.status === col.key);
          return (
            <div key={col.key} className="min-w-[240px] sm:min-w-0">
              <DroppableColumn
                column={col}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
