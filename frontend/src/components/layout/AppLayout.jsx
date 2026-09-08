import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useProcurement } from '../../context/ProcurementContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useProcurement();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sideblock Single Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Sticky Topbar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Global Toast Alert */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            {toast.type === 'success' ? (
              <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="size-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="size-5 text-sky-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{toast.message}</span>
          </div>
        )}

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
