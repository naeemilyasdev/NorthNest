import React from 'react';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="spinner mb-4 mx-auto" style={{ width: '40px', height: '40px' }}></div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 dark:text-accent/75">{message}</p>
      </div>
    </div>
  );
};

