import { useState } from 'react';
import {
  Send,
  LifeBuoy
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function GrievanceFeedback() {
  const { grievances, submitGrievance } = useProcurement();

  const [formData, setFormData] = useState({
    category: 'WEIGHMENT_DISPUTE',
    subject: '',
    description: '',
    relatedToken: 'A105',
    relatedLot: 'LOT-2026-001',
    priority: 'HIGH'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;
    submitGrievance(formData);
    setFormData({
      category: 'WEIGHMENT_DISPUTE',
      subject: '',
      description: '',
      relatedToken: '',
      relatedLot: '',
      priority: 'MEDIUM'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Farmer Grievance &amp; Feedback Redressal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct dispute redressal portal for weighment appeals, DBT payment delays, and slot scheduling assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Submission Form */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <LifeBuoy className="size-4 text-emerald-600" />
            Lodge Formal Grievance
          </h3>
          <p className="text-xs text-slate-500 mb-4">Assigned to Mandi Grievance Officer within 24 hours</p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800"
              >
                <option value="WEIGHMENT_DISPUTE">Weighbridge Weight Discrepancy</option>
                <option value="PAYMENT_QUERY">PFMS Bank Payment Delay / Query</option>
                <option value="SLOT_RESCHEDULE">Procurement Slot Reschedule Request</option>
                <option value="QUALITY_APPEAL">Quality Grade Re-testing Appeal</option>
                <option value="GATE_DELAY">Gate Security Congestion Issue</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Title *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g. Tare weight re-check required on trolley"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Token Number</label>
                <input
                  type="text"
                  value={formData.relatedToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, relatedToken: e.target.value }))}
                  placeholder="e.g. A105"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                >
                  <option value="LOW">Low (Standard)</option>
                  <option value="MEDIUM">Medium (Normal)</option>
                  <option value="HIGH">High (Urgent Yard Action)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explain the discrepancy or concern in detail..."
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <Send className="size-3.5" /> Submit Grievance Ticket
            </button>
          </form>
        </div>

        {/* Existing Grievances Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grievance Ticket Registry</h3>
              <p className="text-xs text-slate-500">Official log of farmer feedback and resolution timestamps</p>
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {grievances.length} Tickets
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {grievances.map(grv => (
              <div key={grv.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{grv.id}</span>
                      <StatusBadge status={grv.status} size="xs" />
                      <StatusBadge status={grv.priority} size="xs" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">{grv.subject}</h4>
                  </div>
                  <span className="text-tiny font-medium text-slate-400 shrink-0 font-mono">{grv.submittedAt || grv.createdAt}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {grv.description}
                </p>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-tiny text-slate-600">
                  <strong>Officer Resolution Notes:</strong> {grv.resolutionNotes || 'Investigation underway by APMC field squad.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
