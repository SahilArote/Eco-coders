import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Search, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import PaymentVoucherPrint from '../../components/documents/PaymentVoucherPrint';

export default function AccountsDashboard() {
  const { payments, currentCenter, processSinglePayment, processBulkPayment, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/accounts
  useEffect(() => {
    if (currentRole !== 'accounts_officer') {
      setCurrentRole('accounts_officer');
    }
  }, [currentRole, setCurrentRole]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [printVoucherPayment, setPrintVoucherPayment] = useState(null);

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'INITIATED');
  const paidPayments = payments.filter(p => p.status === 'PAID');

  const totalPaidAmount = paidPayments.reduce((acc, p) => acc + (p.finalAmount || p.netPayableAmount || 0), 0);
  const totalPendingAmount = pendingPayments.reduce((acc, p) => acc + (p.finalAmount || p.netPayableAmount || 0), 0);

  const toggleSelectPayment = (id) => {
    setSelectedPayments(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    if (selectedPayments.length === pendingPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(pendingPayments.map(p => p.id));
    }
  };

  const handleExecuteBatchPayment = () => {
    processBulkPayment(selectedPayments);
    setSelectedPayments([]);
    setConfirmModalOpen(false);
  };

  const filteredPayments = payments.filter(p => 
    p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.paymentRef && p.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">
              TREASURY & ACCOUNTS
            </span>
            <span className="text-xs text-slate-400">• PFMS Direct Benefit Transfer (DBT) Division</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Payment & Accounts Officer Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Public Financial Management System Electronic Bank Credit Gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            PFMS Portal Bridge: Connected
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Accounts Officer Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Payments Processed"
          value={`₹${(totalPaidAmount / 100000).toFixed(2)} L`}
          sublabel={`${paidPayments.length} transactions settled via PFMS`}
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Pending Payments"
          value={pendingPayments.length}
          sublabel="Farmer payment vouchers queued"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Total Payable"
          value={`₹${(totalPendingAmount / 100000).toFixed(2)} L`}
          sublabel="Awaiting batch DBT disbursement"
          icon={CreditCard}
          color="teal"
        />
        <MetricCard
          title="Today's Settlements"
          value="18 Lots"
          sublabel="Clearing cycle active"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Main Payment & DBT Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">PFMS DBT Disbursement Ledger</h3>
            <p className="text-[11px] text-slate-400">Select pending payment batches to execute instant simulated bank transfer.</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedPayments.length > 0 && (
              <button
                onClick={() => setConfirmModalOpen(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Process {selectedPayments.length} Selected Vouchers
              </button>
            )}

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search farmer, reference, bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length > 0 && selectedPayments.length === pendingPayments.length}
                    onChange={handleSelectAllPending}
                    className="w-3.5 h-3.5 accent-teal-600 rounded"
                  />
                </th>
                <th className="pb-2.5">Voucher / Ref</th>
                <th className="pb-2.5">Farmer Beneficiary</th>
                <th className="pb-2.5">Bank & Account</th>
                <th className="pb-2.5">Net Amount (₹)</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Settlement UTR</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.slice(0, 8).map((pay) => {
                const isSelected = selectedPayments.includes(pay.id);
                const isPending = pay.status === 'PENDING' || pay.status === 'INITIATED';

                return (
                  <tr key={pay.id} className={`hover:bg-slate-50/70 ${isSelected ? 'bg-teal-50/50' : ''}`}>
                    <td className="py-2.5">
                      {isPending ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPayment(pay.id)}
                          className="w-3.5 h-3.5 accent-teal-600 rounded cursor-pointer"
                        />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </td>
                    <td className="py-2.5 font-mono">
                      <span className="font-bold text-slate-900 block">{pay.paymentRef || pay.id}</span>
                      <span className="text-[10px] text-slate-400">Lot: {pay.lotId}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 block">{pay.farmerName}</span>
                      <span className="text-[10px] text-slate-400">{pay.farmerId}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-slate-800 font-medium block">{pay.bankName || 'State Bank of India'}</span>
                      <span className="text-[10px] font-mono text-slate-500">{pay.accountMasked || '••••••••5412'}</span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-900 text-sm">
                      ₹{(pay.finalAmount || pay.netPayableAmount)?.toLocaleString('en-IN') || '79,942.50'}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={pay.status === 'PAID' ? 'PAYMENT_COMPLETED' : 'PAYMENT_PROCESSING'} size="sm" />
                    </td>
                    <td className="py-2.5 font-mono text-[11px]">
                      {pay.utrNumber ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pay.utrNumber}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Awaiting Batch</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      <button
                        onClick={() => setPrintVoucherPayment(pay)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-teal-800 bg-slate-100 hover:bg-teal-50 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        Voucher
                      </button>

                      {isPending && (
                        <button
                          onClick={() => processSinglePayment(pay.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Pay DBT
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Showing {Math.min(filteredPayments.length, 8)} of {payments.length} payment records</span>
          <span className="font-semibold text-teal-700">PFMS Direct Credit Protocol Active</span>
        </div>
      </div>

      {/* Confirmation Modal for Bulk Payment */}
      {confirmModalOpen && (
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleExecuteBatchPayment}
          title={`Execute Bulk DBT Payment (${selectedPayments.length} Vouchers)`}
          message={`Are you sure you want to authorize Direct Benefit Transfer for ${selectedPayments.length} approved farmer accounts? Total amount will be credited and verified via simulated PFMS bank protocol with unique UTR generation.`}
          confirmText="Yes, Disburse Batch"
          type="success"
        />
      )}

      {/* Printable Payment Voucher Modal */}
      {printVoucherPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <PaymentVoucherPrint payment={printVoucherPayment} />
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPrintVoucherPayment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Voucher Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
