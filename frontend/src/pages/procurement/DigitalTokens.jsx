import { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';
import Timeline from '../../components/common/Timeline';

export default function DigitalTokens() {
  const { tokens, lots, counters, showToast } = useProcurement();

  // Selected Token: default A105
  const [selectedTokenNumber, setSelectedTokenNumber] = useState('A105');

  const activeToken = tokens.find(t => t.tokenNumber === selectedTokenNumber) || tokens[0];
  const associatedLot = lots.find(l => l.tokenNumber === activeToken?.tokenNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Digital Procurement Tokens</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time digital token tracking, heuristic queue waiting estimates, and automated lifecycle dispatch
          </p>
        </div>

        {/* Token Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-tiny font-bold uppercase text-slate-400 mr-1">Switch:</span>
          {tokens.slice(0, 6).map(t => (
            <button
              key={t.tokenNumber}
              onClick={() => setSelectedTokenNumber(t.tokenNumber)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                t.tokenNumber === selectedTokenNumber
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.tokenNumber}
            </button>
          ))}
        </div>
      </div>

      {activeToken && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Digital Token Card (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* The Physical / Electronic Token Pass Card */}
            <div className="rounded-3xl border-2 border-slate-800 bg-white p-6 sm:p-8 shadow-md relative overflow-hidden">
              {/* Green Agricultural Header Accent */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500" />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-tiny font-bold text-emerald-800 uppercase tracking-wider">
                      Government APMC Authorized E-Token
                    </span>
                    <StatusBadge status={activeToken.status} size="xs" />
                  </div>
                  <h2 className="mt-2 text-4xl font-black font-mono tracking-tight text-slate-900">
                    TOKEN {activeToken.tokenNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Procurement Center: <strong>{activeToken.centerName}</strong>
                  </p>
                </div>

                {/* QR Code Placeholder Box */}
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-800 bg-slate-50 p-3 shrink-0">
                  <QrCode className="size-20 text-slate-900" />
                  <span className="mt-1 text-tiny font-mono font-bold text-slate-600">
                    {activeToken.tokenNumber} • VERIFIED
                  </span>
                </div>
              </div>

              {/* Farmer & Appointment Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-tiny">Farmer Name</span>
                  <strong className="text-slate-900 text-sm">{activeToken.farmerName}</strong>
                  <span className="block text-tiny text-slate-400">ID: {activeToken.farmerId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-tiny">Commodity &amp; Variety</span>
                  <strong className="text-slate-900 text-sm">{activeToken.commodity}</strong>
                  <span className="block text-tiny text-slate-400">{activeToken.variety || 'FAQ Quality'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-tiny">Appointment Slot</span>
                  <strong className="text-slate-900 text-sm">{activeToken.appointmentSlot}</strong>
                  <span className="block text-tiny text-slate-400">{activeToken.appointmentDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-tiny">Assigned Scale Desk</span>
                  <strong className="text-emerald-700 text-sm">{activeToken.counterAssigned || 'Counter 2'}</strong>
                  <span className="block text-tiny text-slate-400">Gate: {activeToken.gateNumber || 'Gate 2'}</span>
                </div>
              </div>

              {/* Live Queue Real-time Position Box */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="sm:border-r border-slate-200 pb-3 sm:pb-0">
                    <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
                      Currently Serving
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                      {activeToken.currentTokenServing || 'A088'}
                    </span>
                    <span className="text-tiny text-emerald-600 font-semibold">Counter 1 &amp; 2 Active</span>
                  </div>

                  <div className="sm:border-r border-slate-200 pb-3 sm:pb-0">
                    <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
                      People Ahead of You
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
                      {activeToken.peopleAhead} Vehicles
                    </span>
                    <span className="text-tiny text-slate-500">In physical mandi yard</span>
                  </div>

                  <div>
                    <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block">
                      Estimated Waiting Time
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
                      ~{activeToken.estimatedWaitMinutes} Mins
                    </span>
                    <span className="text-tiny text-slate-500">Continuous queue calculation</span>
                  </div>
                </div>
              </div>

              {/* Vehicle & Security Strip */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-slate-400" />
                  <span>Authorized Vehicle: <strong className="text-slate-800 font-mono">{activeToken.vehicleNumber}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-tiny text-slate-400">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>QR Authenticated by Maharashtra Mandi Board Security</span>
                </div>
              </div>
            </div>

            {/* Complete Lifecycle Stepper for this Token */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Token Stage Progression
              </h3>
              <Timeline
                currentStatus={activeToken.status}
                history={associatedLot?.timeline || []}
              />
            </div>
          </div>

          {/* Right Column: AI Waiting Time Explanation & Actions */}
          <div className="space-y-6">
            {/* AI Waiting Time Heuristics Explanation (Section 15) */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="size-4 text-amber-600" />
                <span>AI Waiting-Time Prediction</span>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-black text-amber-950 font-mono">
                  ~{activeToken.estimatedWaitMinutes} minutes
                </span>
                <p className="text-xs font-semibold text-amber-800 mt-1">
                  Estimated waiting time based on current queue conditions.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-2 text-xs text-amber-950">
                <p className="font-semibold text-tiny uppercase tracking-wider text-amber-800">
                  Calculation Factors:
                </p>
                <div className="flex items-center justify-between">
                  <span>Current Queue Depth:</span>
                  <strong>{activeToken.peopleAhead} farmers ahead</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Operating Desks:</span>
                  <strong>{counters.filter(c => c.status === 'ACTIVE').length} counters</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Processing Pace:</span>
                  <strong>14 mins per vehicle</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recent Gate Arrivals:</span>
                  <strong>6 in last 30 mins</strong>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/70 p-3 border border-amber-200 text-tiny text-slate-600 leading-relaxed">
                ℹ️ <em>Clear transparency notice: This estimate adapts continuously to weighbridge scale calibration speed and quality assay laboratory throughput.</em>
              </div>
            </div>

            {/* Quick Actions for this Token */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Milestone Actions
              </h3>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Print Digital Token Pass
              </button>

              <button
                onClick={() => showToast(`SMS Token alert dispatched to +91 ${activeToken.farmerMobile}`, 'info')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                Resend Token SMS to Farmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
