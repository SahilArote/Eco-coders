import { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  MapPin, 
  ChevronDown, 
  Check, 
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProcurement } from '../../context/ProcurementContext';
import RoleSwitcher from './RoleSwitcher';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const {
    currentCenter,
    centers,
    selectedCenterId,
    setSelectedCenterId,
    notifications,
    markNotificationAsRead,
    activeRoleObj
  } = useProcurement();

  const [notifOpen, setNotifOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const notifRef = useRef(null);
  const centerRef = useRef(null);

  const unreadCount = notifications.filter(n => !(n.isRead ?? n.read)).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (centerRef.current && !centerRef.current.contains(event.target)) {
        setCenterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-xs">
      {/* Left side: Hamburger + Center Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Center Selector Dropdown */}
        <div className="relative" ref={centerRef}>
          <button
            onClick={() => setCenterOpen(!centerOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MapPin className="size-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 truncate max-w-[160px] md:max-w-[220px]">
                  {currentCenter.name}
                </span>
                <span className={`inline-block size-2 rounded-full ${currentCenter.status === 'OPEN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
              <p className="text-[11px] font-normal text-slate-500">
                {currentCenter.bookedSlots}/{currentCenter.totalCapacity} Slots Booked • {currentCenter.activeCounters} Counters
              </p>
            </div>
            <ChevronDown className="size-3.5 text-slate-400 ml-1" />
          </button>

          {centerOpen && (
            <div className="absolute left-0 mt-2 w-72 md:w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Procurement Mandi Hub
              </div>
              <div className="mt-1 space-y-1">
                {centers.map(center => {
                  const isSelected = center.id === selectedCenterId;
                  return (
                    <button
                      key={center.id}
                      onClick={() => {
                        setSelectedCenterId(center.id);
                        setCenterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{center.name}</p>
                        <p className="text-[11px] text-slate-500">{center.district}, {center.state} • {center.activeCounters} Counters</p>
                      </div>
                      {isSelected && <Check className="size-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Role Switcher + Alerts + Staff Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <RoleSwitcher />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">Mandi Alerts</span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    {unreadCount} new
                  </span>
                </div>
                <Link
                  to="/communication/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar my-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => {
                    const isRead = Boolean(n.isRead ?? n.read);
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                          isRead ? 'hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-semibold ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile & Logout Pill */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-bold text-white shadow-xs">
            {activeRoleObj.shortTitle.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {activeRoleObj.title}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              {activeRoleObj.desk}
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            title="Switch User / Logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
