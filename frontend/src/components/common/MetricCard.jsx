import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-100',
  trend,
  trendPositive = true,
  badgeText,
  onClick,
  className = ''
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
            {badgeText && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
            <Icon className="size-5" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
