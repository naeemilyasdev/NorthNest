import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ className = '', fallbackPath = '/', label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-sm border-2 border-ink/20 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-secondary hover:text-secondary dark:border-accent/20 dark:bg-ink/60 dark:text-accent dark:hover:border-secondary dark:hover:text-secondary ${className}`.trim()}
      aria-label={label}
    >
      <ArrowLeft size={14} />
      <span>{label}</span>
    </button>
  );
};
