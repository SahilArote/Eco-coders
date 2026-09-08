import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function DemoJourneyBanner() {
  const [collapsed, setCollapsed] = useState(false);
  const { resetDemoData, tokens, payments } = useProcurement();

  const tokenA105 = tokens.find(t => t.tokenNumber === 'A105');
  const pay001 = payments.find(p => p.id === 'PAY-2026-001');

  if (collapsed) {
    return (
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-700">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-300" />
          <span className="font-semibold">Interactive Demo Storyline:</span>
          <span className="text-emerald-200">Token A105 (Ramesh Patil • Wheat • APMC Pune)</span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs font-semibold underline text-amber-300 hover:text-amber-200"
        >
          Expand Demo Steps
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 border-b border-emerald-800/80 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold text-xs">
            DEMO
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Live End-to-End Walkthrough Journey
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-tiny px-2 py-0.5 font-normal">
                Frontend Reactive Simulation
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Follow Farmer Ramesh Patil (Token A105) through the 9 procurement milestones without any backend:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoData}
            title="Reset data to initial state"
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
          >
            <RotateCcw className="size-3" /> Reset Demo
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="text-xs text-slate-400 hover:text-white px-1"
          >
            Minimize
          </button>
        </div>
      </div>

      {/* Step Pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs hide-scrollbar">
        <Link
          to="/procurement/schedules"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">1</span>
          <span>Book Slot</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/tokens"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">2</span>
          <span>Token A105 ({tokenA105?.status || 'Active'})</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/queue"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">3</span>
          <span>Live Queue & Counters</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/gate-entry"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">4</span>
          <span>Gate In (MH-12-AQ-4481)</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/quality"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">5</span>
          <span>Quality Assay (Grade A)</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/weighbridge"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">6</span>
          <span>Weighbridge (Net 32.30 Qtl)</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/procurement/lots"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">7</span>
          <span>Lot Clearance</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/payments/overview"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">8</span>
          <span>DBT Disbursement ({pay001?.status || 'PAID'})</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-500 shrink-0" />

        <Link
          to="/documents/tak-patti"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-400/20 text-amber-200 px-3 py-1.5 hover:bg-amber-400/30 transition-colors font-semibold"
        >
          <span className="size-4 rounded-full bg-amber-400 text-slate-900 font-bold text-tiny flex items-center justify-center">9</span>
          <span>Print Tak-Patti (Form J)</span>
        </Link>
      </div>
    </div>
  );
}
