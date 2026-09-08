import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsRead } = useProcurement();

  const [activeCategory, setActiveCategory] = useState('ALL');

  const filtered = notifications.filter(n => {
    if (activeCategory !== 'ALL' && n.category !== activeCategory) return false;
    return true;
  });

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'SUCCESS':
        return { icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'WARNING':
        return { icon: AlertTriangle, bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'ACTION_REQUIRED':
        return { icon: Bell, bg: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' };
      default:
        return { icon: Info, bg: 'bg-sky-100 text-sky-800 border-sky-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mandi Broadcasts &amp; Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated alerts for token calls, assay outcomes, weighments, and PFMS bank disbursements
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <CheckCheck className="size-3.5 text-emerald-600" /> Mark All as Read
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'ACTION_REQUIRED', 'SUCCESS', 'WARNING', 'INFO'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-3 py-1.5 transition-all ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no alerts matching the selected filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(notif => {
              const isRead = Boolean(notif.isRead ?? notif.read);
              const config = getCategoryConfig(notif.category);
              const Icon = config.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 flex items-start gap-4 transition-colors cursor-pointer rounded-xl ${
                    isRead ? 'hover:bg-slate-50' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${config.bg}`}>
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold ${isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-tiny font-medium text-slate-400 shrink-0">{notif.timestamp}</span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-tiny text-slate-400">
                      {notif.center && <span>Mandi: <strong>{notif.center}</strong></span>}
                      {notif.relatedToken && <span>Token: <strong className="font-mono text-emerald-700">{notif.relatedToken}</strong></span>}
                      {notif.relatedLot && <span>Lot: <strong className="font-mono">{notif.relatedLot}</strong></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
