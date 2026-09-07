import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Printer,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import { PaymentVoucherPrint } from '../../components/documents/PaymentVoucherPrint';

export default function PaymentOverview() {
  const { payments } = useProcurement();
  const [printPayment, setPrintPayment] = useState(null);

  // Metrics
  const totalPayable = payments.reduce((sum, p) => sum + p.finalAmount, 0);
  const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.finalAmount, 0);
  const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.finalAmount, 0);
  const processingAmount = payments.filter(p => p.status === 'PROCESSING').reduce((sum, p) => sum + p.finalAmount, 0);
  const failedAmount = payments.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + p.finalAmount, 0);

  const columns = [
    {
      key: 'id',
      label: 'Payment ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-xs text-slate-900">{val}</span>
          <span className="block text-tiny font-mono text-slate-400">{row.paymentRef}</span>
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
      key: 'lotId',
      label: 'Lot ID',
      sortable: true,
      render: (val) => <span className="font-mono text-xs font-semibold text-emerald-800">{val}</span>
    },
    {
      key: 'commodity',
      label: 'Commodity',
      render: (val, row) => <span>{val} ({row.quantityQuintals} Qtl)</span>
    },
    {
      key: 'grossValue',
      label: 'Gross Value',
      align: 'right',
      render: (val) => <span className="font-mono text-xs">₹{val?.toLocaleString('en-IN')}</span>
    },
    {
      key: 'finalAmount',
      label: 'Net Disbursed',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono font-bold text-xs text-emerald-800">₹{val?.toLocaleString('en-IN')}</span>
    },
    {
      key: 'bankName',
      label: 'Bank Account',
      render: (val, row) => (
        <div>
          <span className="text-xs">{val}</span>
          <span className="block text-tiny font-mono text-slate-400">{row.accountMasked}</span>
        </div>
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
      label: 'Receipt',
      align: 'right',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPrintPayment(row);
          }}
          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
          title="Print Payment Voucher"
        >
          <Printer className="size-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Direct Benefit Transfer (DBT) Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulated Public Financial Management System (PFMS) Aadhaar-linked electronic farmer payment settlement
        </p>
      </div>

      {/* Mandatory Regulatory Simulation Banner (Section 23) */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-amber-700 shrink-0" />
          <span>
            <strong>Payment Status — Demo / Simulated:</strong> Transactions represented in this portal are realistic mock financial disbursements simulating Government PFMS DBT workflows. No real monetary transactions occur.
          </span>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Total Mandi Payable"
          value={`₹${(totalPayable / 100000).toFixed(2)} L`}
          subtext="Cumulative procurement value"
          icon={CreditCard}
          iconBg="bg-slate-100 text-slate-700 border-slate-200"
        />
        <MetricCard
          title="DBT Disbursed (Paid)"
          value={`₹${(paidAmount / 100000).toFixed(2)} L`}
          subtext={`${payments.filter(p => p.status === 'PAID').length} vouchers cleared`}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Pending Accounts Release"
          value={`₹${(pendingAmount / 100000).toFixed(2)} L`}
          subtext={`${payments.filter(p => p.status === 'PENDING').length} cleared lots awaiting sign`}
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
        <MetricCard
          title="Processing in PFMS"
          value={`₹${(processingAmount / 100000).toFixed(2)} L`}
          subtext="Bank batch transmission"
          icon={Clock}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
        />
        <MetricCard
          title="Failed / Re-check"
          value={`₹${(failedAmount / 100000).toFixed(2)} L`}
          subtext="IFSC / Aadhaar mismatch"
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
        />
      </div>

      {/* Main Payment Table */}
      <DataTable
        columns={columns}
        data={payments}
        keyField="id"
        searchFields={['id', 'paymentRef', 'farmerName', 'lotId', 'commodity']}
        searchPlaceholder="Search payment by ID, reference, farmer name, or lot..."
      />

      {/* Printable Voucher Modal */}
      {printPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <PaymentVoucherPrint payment={printPayment} />
            <div className="mt-4 text-center no-print">
              <button
                onClick={() => setPrintPayment(null)}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
