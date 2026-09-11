import React, { useId } from 'react';

export default function Textarea({
  label,
  error,
  helperText,
  id: customId,
  className = '',
  containerClassName = '',
  rows = 3,
  ...props
}) {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <textarea
          id={id}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`
            w-full text-sm rounded-lg transition-colors resize-y
            bg-white dark:bg-slate-900/90
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            border ${
              error
                ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }
            p-3
            focus:outline-none
            disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800
            ${className}
          `.trim()}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs font-medium text-rose-500 dark:text-rose-400">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
