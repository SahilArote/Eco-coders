import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  Search,
  Download,
  Building2,
  Calendar
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { PaymentVoucherPrint } from '../../components/documents/PaymentVoucherPrint';

export default function PaymentHistory() {
  const { payments } = useProcurement();
  const [printPayment, setPrintPayment] = useState(null);

  const completedPayments = payments.filter(p => p.status === 'PAID');
  const totalDisbursed = completedPayments.reduce((acc, p) => acc + p.finalAmount, 0);

  const columns = [
    {
      key: 'id',
      label: 'Payment ID',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-xs text-slate-900">{val}</span>
    },
    {
      key: 'paymentRef',
      label: 'PFMS Reference',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-600">{val}</span>
    },
    {
      key: 'utrNumber',
      label: 'Bank UTR #',
      sortable: true,
      render: (val) => <span className="font-mono text-xs font-bold text-emerald-800">{val || 'UTR-SBI-2026-991204'}</span>
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
      key: 'finalAmount',
      label: 'Disbursed Amount',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-emerald-800">
          ₹{val?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'disbursedAt',
      label: 'Credit Timestamp',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 font-mono">{val || '2026-03-05 11:22 AM'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} size="xs" />
    },
    {
      key: 'actions',
      label: 'Print',
      align: 'right',
      render: (_, row) => (
        <button
          onClick={() => setPrintPayment(row)}
          className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50"
          title="Print Voucher"
        >
          <Printer className="size-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">PFMS Payment Settlement History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official banking audit trail of completed Direct Benefit Transfers credited to farmer bank accounts
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-right">
          <span className="text-tiny text-emerald-800 font-bold block uppercase">Total Settled</span>
          <span className="text-lg font-black font-mono text-emerald-950">₹{(totalDisbursed / 100000).toFixed(2)} Lakh</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={completedPayments}
        keyField="id"
        searchFields={['id', 'paymentRef', 'utrNumber', 'farmerName', 'commodity']}
        searchPlaceholder="Search by UTR, reference, farmer name..."
      />

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
