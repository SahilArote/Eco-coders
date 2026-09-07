import React from 'react';

export function LoadingState({ count = 3, message = 'Loading procurement data...' }) {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <div className="size-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-slate-500">{message}</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Error Loading Data', message = 'Something went wrong while fetching data. Please try again.', onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <h3 className="text-sm font-bold text-rose-800">{title}</h3>
      <p className="mt-1 text-xs text-rose-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
