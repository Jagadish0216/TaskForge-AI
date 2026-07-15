import { TASK_STATUSES, TASK_PRIORITIES, PROJECT_STATUSES } from '../../utils/constants';

export const Badge = ({ type = 'status', value }) => {
  let config = { label: value, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' };

  if (type === 'status' && TASK_STATUSES[value]) {
    config = TASK_STATUSES[value];
  } else if (type === 'priority' && TASK_PRIORITIES[value]) {
    config = TASK_PRIORITIES[value];
  } else if (type === 'projectStatus' && PROJECT_STATUSES[value]) {
    config = PROJECT_STATUSES[value];
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs ${config.color}`}
    >
      {config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default Badge;
