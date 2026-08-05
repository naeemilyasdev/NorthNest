import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClass = 'btn inline-flex items-center justify-center focus:outline-none';

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'bg-error text-white border-2 border-error hover:bg-red-600',
  }[variant];

  const sizeClass = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-sm',
  }[size];

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner mr-2"></span>}
      {children}
    </button>
  );
};
