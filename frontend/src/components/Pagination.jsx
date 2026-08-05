import React from 'react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1 mt-10">
      <button
        className="px-4 py-2 rounded-sm border-2 border-ink/20 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-secondary hover:text-secondary disabled:opacity-40 dark:border-accent/20 dark:text-accent dark:hover:border-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
        <button
          key={p}
          className={`px-4 py-2 rounded-sm border-2 text-xs font-semibold transition ${
            p === page
              ? 'border-ink bg-ink text-accent dark:border-accent dark:bg-accent dark:text-ink'
              : 'border-ink/20 text-ink hover:border-secondary hover:text-secondary dark:border-accent/20 dark:text-accent'
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="px-4 py-2 rounded-sm border-2 border-ink/20 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-secondary hover:text-secondary disabled:opacity-40 dark:border-accent/20 dark:text-accent dark:hover:border-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};
