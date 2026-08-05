import React from 'react';

export const Textarea = ({
  label,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">
          {label}
          {required && <span className="ml-1 text-secondary">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`input-field ${error ? 'border-error focus:border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-error mt-1">{error}</p>}
    </div>
  );
};
