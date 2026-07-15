import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no items to display right now.',
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl my-4 backdrop-blur-sm">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full mb-3 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
