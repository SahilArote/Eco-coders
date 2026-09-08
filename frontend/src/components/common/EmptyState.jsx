import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no entries matching your current filters.',
  icon: Icon = Inbox,
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-200">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
