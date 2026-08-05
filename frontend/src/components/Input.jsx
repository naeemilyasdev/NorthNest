import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  error,
  required = false,
  type = 'text',
  as = 'input',
  className = '',
  helperText,
  children,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const baseClass = `input-field ${error ? 'border-error focus:border-error' : ''} ${isPassword ? 'pr-12' : ''} ${className}`.trim();

  return (
    <div className="w-full mb-5">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/70">
          {label}
          {required && <span className="ml-1 text-secondary">*</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea className={baseClass} {...props} />
      ) : as === 'select' ? (
        <select className={baseClass} {...props}>
          {children}
        </select>
      ) : (
        <div className="relative">
          <input type={currentType} className={baseClass} {...props} />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-ink/60 dark:text-accent/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
      {helperText && <p className="mt-2 text-sm text-ink/70 dark:text-accent/75">{helperText}</p>}
    </div>
  );
};

