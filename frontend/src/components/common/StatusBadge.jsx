import React from 'react';

const STATUS_CONFIGS = {
  // Green / Success
  COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Completed' },
  PAID: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Paid (DBT Cleared)' },
  PASSED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Passed FAQ' },
  ACCEPTED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Accepted' },
  VERIFIED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Verified KYC' },
  OPEN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Open' },
  RESOLVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Resolved' },
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Active' },

  // Amber / Warning & Progress
  PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'Pending' },
  WAITING: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'In Queue' },
  PROCESSING: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500 animate-pulse', label: 'Processing' },
  'QUALITY CHECK': { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'Quality Check' },
  WEIGHMENT: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'Weighment' },
  IN_REVIEW: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'In Review' },
  BUSY: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500', label: 'Busy' },
  'PAYMENT PROCESSING': { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500 animate-pulse', label: 'Payment Processing' },

  // Sky Blue / Info
  BOOKED: { bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', label: 'Booked' },
  ARRIVED: { bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', label: 'Arrived at Gate' },
  'PAYMENT COMPLETED': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500', label: 'Payment Completed' },

  // Rose / Error & Rejection
  REJECTED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500', label: 'Rejected' },
  FAILED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500', label: 'Failed' },
  DELAYED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500', label: 'Delayed' },
  CLOSED: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: 'Closed' },
  IDLE: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Idle' },
  MAINTENANCE: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Maintenance' },
  HIGH: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'High Priority' },
  MEDIUM: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Medium Priority' },
  LOW: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: 'Low Priority' }
};

export default function StatusBadge({ status, customLabel, size = 'sm', showDot = true, className = '' }) {
  const normKey = (status || '').toUpperCase();
  const config = STATUS_CONFIGS[normKey] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown'
  };

  const sizeClasses = size === 'xs' 
    ? 'text-tiny px-2 py-0.5' 
    : size === 'md' 
      ? 'text-sm px-3 py-1' 
      : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`size-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span className="truncate">{customLabel || config.label}</span>
    </span>
  );
}
