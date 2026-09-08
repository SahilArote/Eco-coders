const COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  sky: 'bg-sky-50 text-sky-600 border-sky-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function MetricCard({
  title,
  value,
  subtext,
  sublabel,
  icon: Icon,
  color,
  iconBg,
  trend,
  trendPositive = true,
  badgeText,
  onClick,
  className = ''
}) {
  const displaySubtext = subtext || sublabel;
  const displayIconBg = (color && COLOR_MAP[color]) || iconBg || COLOR_MAP.emerald;

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
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${displayIconBg}`}>
            <Icon className="size-5" />
          </div>
        )}
      </div>

      {(trend || displaySubtext) && (
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
          {displaySubtext && (
            <span className="text-slate-500 truncate">
              {displaySubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
