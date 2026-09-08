import { CheckCircle2, AlertCircle, CircleDot } from 'lucide-react';

const STAGES = [
  { key: 'BOOKED', label: 'Slot Booked', desc: 'Appointment confirmed & Token generated' },
  { key: 'ARRIVED', label: 'Gate Entry', desc: 'Vehicle checked in at APMC gate' },
  { key: 'WAITING', label: 'Queue Waiting', desc: 'Waiting for counter call' },
  { key: 'PROCESSING', label: 'Counter Called', desc: 'Token called to active counter' },
  { key: 'QUALITY CHECK', label: 'Quality Assay', desc: 'Moisture, foreign matter & grading' },
  { key: 'WEIGHMENT', label: 'Weighbridge', desc: 'Gross & Tare certified weighment' },
  { key: 'ACCEPTED', label: 'Lot Accepted', desc: 'APMC Supervisor clearance' },
  { key: 'COMPLETED', label: 'Procurement Done', desc: 'Tak-Patti & Receipt generated' },
  { key: 'PAYMENT PROCESSING', label: 'DBT Processing', desc: 'PFMS direct bank transfer queue' },
  { key: 'PAYMENT COMPLETED', label: 'Payment Credited', desc: 'Settlement credited with UTR ref' }
];

export default function Timeline({ currentStatus = 'BOOKED', history = [] }) {
  const normalizedStatus = (currentStatus || '').toUpperCase();
  const isRejected = normalizedStatus === 'REJECTED';

  // Find index of current stage in STAGES
  let currentIndex = STAGES.findIndex(s => s.key === normalizedStatus);
  if (normalizedStatus === 'PAID') currentIndex = STAGES.length - 1;
  if (currentIndex === -1) currentIndex = 2; // fallback

  return (
    <div className="py-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        Procurement Lifecycle Progression
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STAGES.map((stage, idx) => {
          const isDone = !isRejected && idx <= currentIndex;
          const isCurrent = !isRejected && idx === currentIndex;

          // Find if there is a recorded history item
          const historyItem = history.find(h => h.stage?.toLowerCase().includes(stage.key.toLowerCase().split(' ')[0]));

          return (
            <div key={stage.key} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0 flex size-5 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                      ? 'border-amber-500 bg-white text-amber-600 ring-4 ring-amber-100'
                      : 'border-slate-300 bg-white text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-3 stroke-[3]" />
                ) : isCurrent ? (
                  <CircleDot className="size-3 animate-pulse" />
                ) : (
                  <div className="size-1.5 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-amber-700' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                  {historyItem?.time && (
                    <span className="text-tiny font-medium text-slate-400">
                      {historyItem.time}
                    </span>
                  )}
                </div>
                <p className="text-tiny text-slate-500 mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}

        {/* If Rejected */}
        {isRejected && (
          <div className="relative group">
            <div className="absolute -left-6 top-0 flex size-5 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500 text-white ring-4 ring-rose-100">
              <AlertCircle className="size-3 stroke-[3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-700">
                Lot Rejected
              </span>
              <p className="text-tiny text-rose-600 mt-0.5">
                Quality assay failed moisture or foreign matter permissible thresholds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
