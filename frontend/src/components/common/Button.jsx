import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary:
    'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium shadow-sm border border-blue-500/30 dark:border-blue-600/40',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700/80 shadow-sm',
  ghost:
    'hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium dark:hover:bg-slate-800/60 dark:text-slate-300 dark:hover:text-white',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium shadow-sm border border-rose-500/30',
  ai:
    'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium shadow-sm border border-cyan-500/30 dark:bg-cyan-600/90 dark:hover:bg-cyan-500',
  icon:
    'p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg',
};

const sizeStyles = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  lg: 'px-4 py-2.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const isIconOnly = variant === 'icon';

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const combinedClasses = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${isIconOnly ? '' : (sizeStyles[size] || sizeStyles.md)}
    ${className}
  `.trim();

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
      )}

      {children && <span>{children}</span>}

      {!loading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </Component>
  );
}
