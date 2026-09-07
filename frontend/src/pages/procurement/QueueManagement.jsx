import React, { useState } from 'react';
import {
  Users2,
  Clock,
  ArrowRight,
  RotateCcw,
  Volume2,
  Play,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Filter
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function QueueManagement() {
  const {
    tokens,
    counters,
    callNextToken,
    skipToken,
    recallToken,
    currentCenter
  } = useProcurement();

  const waitingTokens = tokens.filter(t => ['ARRIVED', 'WAITING'].includes(t.status));
  const activeTokens = tokens.filter(t => t.status === 'PROCESSING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Live Queue &amp; Counter Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time physical mandi queue dispatch, electronic counter calling, and vehicle throughput controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-600 animate-ping" />
            Live Queue Sync Active
          </span>
        </div>
      </div>

      {/* Main Queue High-Visibility KPI Strip */}
      <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-6 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          <div className="pt-2 sm:pt-0">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
              Currently Serving
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
              A088
            </span>
            <span className="text-tiny text-slate-300">Counter 1</span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
              Next in Line
            </span>
            <span className="text-3xl font-black font-mono text-amber-300 mt-1 block">
              {waitingTokens[0]?.tokenNumber || 'A091'}
            </span>
            <span className="text-tiny text-slate-300">Ready at Gate 2</span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
              Vehicles Waiting
            </span>
            <span className="text-3xl font-black font-mono text-white mt-1 block">
              {waitingTokens.length}
            </span>
            <span className="text-tiny text-slate-300">In physical yard</span>
          </div>

          <div className="pt-2 sm:pt-0">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
              Active Counters
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
              {counters.filter(c => c.status === 'ACTIVE').length} / {counters.length}
            </span>
            <span className="text-tiny text-slate-300">Scale &amp; Lab Desks</span>
          </div>

          <div className="pt-2 sm:pt-0 col-span-2 sm:col-span-1">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
              Estimated Average Wait
            </span>
            <span className="text-3xl font-black font-mono text-amber-400 mt-1 block">
              ~{currentCenter.avgWaitTimeMinutes} mins
            </span>
            <span className="text-tiny text-slate-300">Dynamic prediction</span>
          </div>
        </div>
      </div>

      {/* Operator Desk: Active Counters Dispatch Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Operator Counter Consoles</h3>
            <p className="text-xs text-slate-500">Dispatch, call next tokens, announce recalls, or skip delayed vehicles</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Mandi: <strong>{currentCenter.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {counters.map(counter => {
            const isActive = counter.status === 'ACTIVE';
            return (
              <div
                key={counter.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isActive ? 'border-slate-200 bg-white shadow-xs' : 'border-dashed border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{counter.name}</h4>
                    <span className="text-tiny text-slate-500">Operator: {counter.operator}</span>
                  </div>
                  <span className={`size-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                <div className="my-4 text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
                    Now Serving
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-700 mt-0.5 block">
                    {counter.currentToken || '— IDLE —'}
                  </span>
                  <span className="text-tiny text-slate-500">
                    {counter.servedToday} vehicles cleared today
                  </span>
                </div>

                {/* Operator Control Buttons (Section 14) */}
                {isActive ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => callNextToken(counter.id)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-2 text-tiny font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <Play className="size-3 fill-current" /> Call Next
                    </button>

                    <button
                      type="button"
                      disabled={!counter.currentToken}
                      onClick={() => recallToken(counter.currentToken)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-tiny font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <Volume2 className="size-3" /> Recall
                    </button>

                    <button
                      type="button"
                      disabled={!counter.currentToken}
                      onClick={() => skipToken(counter.id, counter.currentToken)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-tiny font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-40"
                    >
                      <SkipForward className="size-3" /> Skip
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs font-medium text-slate-400">
                    Counter offline / scheduled break
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting Vehicles Queue Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Waiting Line Queue Table</h3>
            <p className="text-xs text-slate-500">Chronological queue order of farmers arrived at the mandi yard</p>
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {waitingTokens.length} Farmers in Queue
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Queue #</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Farmer Name</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Gate In Time</th>
                <th className="px-4 py-3">Wait Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Quick Call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {waitingTokens.slice(0, 10).map((t, index) => (
                <tr key={t.tokenNumber} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-500">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                    {t.tokenNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {t.farmerName}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {t.vehicleNumber}
                  </td>
                  <td className="px-4 py-3">
                    {t.commodity}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {t.checkInTime || '09:30 AM'}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-700">
                    ~{(index + 1) * 3} mins
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => callNextToken(1)}
                      className="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-tiny font-bold hover:bg-emerald-100"
                    >
                      Call to Counter 1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
