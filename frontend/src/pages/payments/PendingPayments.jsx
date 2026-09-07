import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function PendingPayments() {
  const { payments, processBulkPayment, processSinglePayment } = useProcurement();

  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');

  // Compute summary for selected rows
  const selectedPaymentObjects = pendingPayments.filter(p => selectedRows.includes(p.id));
  const selectedTotalQtl = selectedPaymentObjects.reduce((acc, p) => acc + p.quantityQuintals, 0).toFixed(2);
  const selectedTotalAmount = selectedPaymentObjects.reduce((acc, p) => acc + p.finalAmount, 0);

  const handleConfirmBatchPayment = () => {
    processBulkPayment(selectedRows);
    setSelectedRows([]);
    setConfirmModalOpen(false);
  };

  const columns = [
    {
      key: 'id',
      label: 'Payment ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-xs text-slate-900">{val}</span>
          <span className="block text-tiny font-mono text-slate-400">Lot: {row.lotId}</span>
        </div>
      )
    },
    {
      key: 'farmerName',
      label: 'Farmer',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{val}</span>
          <span className="block text-tiny text-slate-400">{row.village}</span>
        </div>
      )
    },
    {
      key: 'commodity',
      label: 'Commodity',
      render: (val, row) => <span>{val} ({row.quantityQuintals} Qtl)</span>
    },
    {
      key: 'bankName',
      label: 'Beneficiary Bank',
      render: (val, row) => (
        <div>
          <span className="text-xs">{val}</span>
          <span className="block text-tiny font-mono text-slate-400">{row.accountMasked}</span>
        </div>
      )
    },
    {
      key: 'finalAmount',
      label: 'Payable Amount',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-emerald-800">
          ₹{val?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'DBT Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="xs" />
    },
    {
      key: 'actions',
      label: 'Disburse',
      align: 'right',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            processSinglePayment(row.id);
          }}
          className="rounded-lg bg-emerald-600 px-3 py-1 text-tiny font-bold text-white hover:bg-emerald-700 shadow-xs"
        >
          Disburse Now
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pending DBT Disbursements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cleared lots awaiting electronic Public Financial Management System (PFMS) credit authorization
          </p>
        </div>

        {selectedRows.length > 0 && (
          <button
            onClick={() => setConfirmModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all animate-pulse"
          >
            <CreditCard className="size-4" /> Process Payment ({selectedRows.length} Selected)
          </button>
        )}
      </div>

      {/* Bulk Selection Summary Banner */}
      {selectedRows.length > 0 && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-tiny uppercase tracking-wider text-emerald-800 font-bold block">Selected Vouchers</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{selectedRows.length} Farmers</span>
            </div>
            <div className="h-8 w-px bg-emerald-300" />
            <div>
              <span className="text-tiny uppercase tracking-wider text-emerald-800 font-bold block">Total Quantity</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{selectedTotalQtl} Qtl</span>
            </div>
            <div className="h-8 w-px bg-emerald-300" />
            <div>
              <span className="text-tiny uppercase tracking-wider text-emerald-800 font-bold block">Total Amount Payable</span>
              <span className="text-xl font-black text-emerald-950 font-mono">₹{selectedTotalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-xs hover:bg-emerald-700"
          >
            CONFIRM &amp; DISBURSE NOW
          </button>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={pendingPayments}
        keyField="id"
        selectable={true}
        selectedRows={selectedRows}
        onSelectRow={(id) => {
          setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }}
        onSelectAll={(ids) => setSelectedRows(ids)}
        searchFields={['id', 'farmerName', 'lotId', 'commodity']}
        searchPlaceholder="Search pending vouchers by ID, farmer name, or lot..."
        emptyMessage="No pending payments found. All procurement lots have been settled."
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmBatchPayment}
        title="Authorize Batch DBT Disbursement"
        message={`You are about to approve simulated PFMS Direct Benefit Transfer for ${selectedRows.length} farmer lots totaling ₹${selectedTotalAmount.toLocaleString('en-IN')}. Electronic UTR settlement numbers will be generated.`}
        confirmText="Confirm Batch Transfer"
        type="success"
      />
    </div>
  );
}
