import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  Eye,
  CreditCard,
  Package,
  CheckCircle2
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';
import Timeline from '../../components/common/Timeline';
import TakPattiPrint from '../../components/documents/TakPattiPrint';

export default function ProcurementLots({ defaultTab = 'all' }) {
  const { lots, crops, completeLot, processBulkPayment, payments, showToast } = useProcurement();

  const activeTab = defaultTab;
  const approvedLots = lots.filter(l => l.status === 'COMPLETED' || l.status === 'ACCEPTED');
  const displayLots = activeTab === 'approved' ? approvedLots : lots;

  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [printLot, setPrintLot] = useState(null);

  // Columns definition
  const columns = [
    {
      key: 'lotNumber',
      label: 'Lot ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{val || row.id}</span>
          <span className="block text-tiny font-mono text-emerald-700">Token: {row.tokenNumber}</span>
        </div>
      )
    },
    {
      key: 'farmerName',
      label: 'Farmer',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-900 text-xs">{val}</span>
          <span className="block text-tiny text-slate-400">{row.village}, {row.district}</span>
        </div>
      )
    },
    {
      key: 'commodity',
      label: 'Commodity',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold text-slate-800">{val}</span>
      )
    },
    {
      key: 'quantityQuintals',
      label: 'Net Qty (Qtl)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-slate-900">{val} Qtl</span>
      )
    },
    {
      key: 'assay.grade',
      label: 'Grade',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
          Grade {val || 'A'}
        </span>
      )
    },
    {
      key: 'financials.effectiveRatePerQtl',
      label: 'Rate / Qtl',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs text-slate-700">₹{val?.toLocaleString()}</span>
      )
    },
    {
      key: 'financials.netPayableAmount',
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
      label: 'Lot Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="xs" />
    },
    {
      key: 'paymentStatus',
      label: 'DBT Payment',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="xs" />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedLot(row)}
            title="Inspect Details"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => setPrintLot(row)}
            title="Print Mandi Tak-Patti (Form J)"
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Printer className="size-4" />
          </button>
        </div>
      )
    }
  ];

  // Bulk actions
  const handleBulkPayment = () => {
    // Find associated payment IDs
    const pIds = payments.filter(p => selectedRows.includes(p.lotId)).map(p => p.id);
    if (pIds.length > 0) {
      processBulkPayment(pIds);
      setSelectedRows([]);
    } else {
      showToast('Selected lots do not have pending payment records yet.', 'warning');
    }
  };

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'ACCEPTED', label: 'Accepted' },
        { value: 'WEIGHMENT', label: 'Weighment' },
        { value: 'QUALITY CHECK', label: 'Quality Check' },
        { value: 'WAITING', label: 'In Queue' },
        { value: 'REJECTED', label: 'Rejected' }
      ]
    },
    {
      key: 'commodity',
      label: 'Commodity',
      options: crops.map(c => ({ value: c.name, label: c.name }))
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Procurement Lot Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official government mandi lot ledger. Track gate weighments, quality grades, deductions, and payment clearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const cleared = displayLots.filter(l => l.status === 'ACCEPTED').slice(0, 5).map(l => l.id);
              setSelectedRows(cleared);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Select Cleared Lots
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <div className="flex gap-2">
          <Link
            to="/procurement/lots"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="size-3.5" />
            <span>All Procurement Lots ({lots.length})</span>
          </Link>
          <Link
            to="/procurement/lots/approved"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'approved'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Approved Lots ({approvedLots.length})</span>
          </Link>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={displayLots}
        keyField="id"
        selectable={true}
        selectedRows={selectedRows}
        onSelectRow={(id) => {
          setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }}
        onSelectAll={(ids) => setSelectedRows(ids)}
        onRowClick={(row) => setSelectedLot(row)}
        searchFields={['lotNumber', 'tokenNumber', 'farmerName', 'commodity', 'vehicleNumber']}
        filters={filters}
        bulkActions={
          <button
            onClick={handleBulkPayment}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <CreditCard className="size-3.5" /> Execute Batch DBT Payment
          </button>
        }
      />

      {/* Slide-over Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedLot)}
        onClose={() => setSelectedLot(null)}
        title={selectedLot ? `Procurement Lot: ${selectedLot.lotNumber}` : 'Lot Particulars'}
        subtitle={`Farmer: ${selectedLot?.farmerName} • Token: ${selectedLot?.tokenNumber}`}
        footer={
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedLot?.status === 'ACCEPTED') {
                  completeLot(selectedLot.id);
                }
              }}
              disabled={selectedLot?.status === 'COMPLETED'}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {selectedLot?.status === 'COMPLETED' ? 'Procurement Complete' : 'Accept Lot into Billing'}
            </button>

            <button
              onClick={() => {
                setPrintLot(selectedLot);
                setSelectedLot(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="size-3.5" /> Print Form J Tak-Patti
            </button>
          </div>
        }
      >
        {selectedLot && (
          <div className="space-y-6 text-xs">
            {/* Summary Highlights */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-tiny text-slate-400 block">Commodity</span>
                  <strong className="text-slate-800 text-sm">{selectedLot.commodity}</strong>
                </div>
                <div>
                  <span className="text-tiny text-slate-400 block">Net Quantity</span>
                  <strong className="text-emerald-700 text-sm font-mono">{selectedLot.quantityQuintals} Qtl</strong>
                </div>
                <div>
                  <span className="text-tiny text-slate-400 block">Payable Amount</span>
                  <strong className="text-slate-900 text-sm font-mono">₹{selectedLot.financials?.netPayableAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-tiny text-slate-400 block">Payment State</span>
                  <StatusBadge status={selectedLot.paymentStatus} size="xs" />
                </div>
              </div>
            </div>

            {/* 9-Stage Timeline */}
            <Timeline currentStatus={selectedLot.status} history={selectedLot.timeline || []} />

            {/* Farmer & Gate Details */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-tiny">
                Farmer &amp; Gate Particulars
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Farmer: <strong>{selectedLot.farmerName}</strong> ({selectedLot.farmerId})</div>
                <div>Village: <strong>{selectedLot.village}, {selectedLot.district}</strong></div>
                <div>Vehicle: <strong className="font-mono">{selectedLot.vehicleNumber}</strong></div>
                <div>Gate In Time: <strong>{selectedLot.gateEntryTime}</strong></div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-tiny">
                Financial Calculation &amp; MSP Rates
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Government MSP Rate:</span>
                  <span className="font-mono">₹{selectedLot.financials?.mspRate?.toLocaleString()} / Qtl</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Quality Grade Bonus (Grade {selectedLot.assay?.grade}):</span>
                  <span className="font-mono">+₹{selectedLot.financials?.qualityBonusRate || 0} / Qtl</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-slate-100 pt-1">
                  <span>Effective Rate / Quintal:</span>
                  <span className="font-mono">₹{selectedLot.financials?.effectiveRatePerQtl?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Deductions:</span>
                  <span className="font-mono">-₹{selectedLot.financials?.deductions?.totalDeductions || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t-2 border-slate-900 pt-1.5 text-slate-900">
                  <span>Net Payable Amount:</span>
                  <span className="font-mono text-emerald-800">
                    ₹{selectedLot.financials?.netPayableAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Printable Modal */}
      {printLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <TakPattiPrint lot={printLot} onClose={() => setPrintLot(null)} />
            <div className="mt-4 text-center no-print">
              <button
                onClick={() => setPrintLot(null)}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Print Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
