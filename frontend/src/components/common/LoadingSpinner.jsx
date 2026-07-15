export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Loading TaskForge AI...
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-1.5">
          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
      <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

export default LoadingSpinner;
