import { useState } from 'react';
import {
  FileText,
  Scale,
  Receipt,
  Award,
  FileCheck,
  Printer
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import TakPattiPrint from '../../components/documents/TakPattiPrint';
import WeighmentSlipPrint from '../../components/documents/WeighmentSlipPrint';
import { GatePassPrint, PaymentVoucherPrint } from '../../components/documents/GatePassPrint';

export default function DocumentCenter({ defaultTab = 'tak-patti' }) {
  const { lots, tokens, payments } = useProcurement();

  const [activeDocType, setActiveDocType] = useState(defaultTab);
  const [prevDefaultTab, setPrevDefaultTab] = useState(defaultTab);
  const [selectedLotId, setSelectedLotId] = useState('LOT-2026-001');

  if (defaultTab !== prevDefaultTab) {
    setPrevDefaultTab(defaultTab);
    setActiveDocType(defaultTab);
  }

  const selectedLot = lots.find(l => l.id === selectedLotId) || lots[0];
  const selectedToken = tokens.find(t => t.tokenNumber === selectedLot?.tokenNumber) || tokens[0];
  const selectedPayment = payments.find(p => p.lotId === selectedLot?.id) || payments[0];

  const docTypes = [
    { id: 'tak-patti', title: 'Mandi Tak-Patti (Form J)', icon: FileText, desc: 'Official APMC Auction & Procurement Settlement Slip' },
    { id: 'weighment', title: 'Certified Weighment Slip', icon: Scale, desc: 'Avery Weigh-Tronix Electronic Bridge Scale Certificate' },
    { id: 'receipt', title: 'Procurement Receipt', icon: Receipt, desc: 'Official Warehouse Inward Deposit Acknowledgement' },
    { id: 'payment', title: 'PFMS Payment Voucher', icon: Award, desc: 'Aadhaar-linked Direct Benefit Transfer Settlement' },
    { id: 'gate-pass', title: 'Inward Gate Pass', icon: FileCheck, desc: 'Authorized Yard Entry & Security Clearance' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">APMC Document &amp; Certificate Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official government agricultural procurement documents, weighment certificates, and settlement slips
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <Printer className="size-3.5" /> Print Selected Document
          </button>
        </div>
      </div>

      {/* Document Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 no-print">
        {docTypes.map(doc => {
          const Icon = doc.icon;
          const isActive = activeDocType === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setActiveDocType(doc.id)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-2 ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="size-4" />
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-emerald-950' : 'text-slate-800'}`}>
                {doc.title}
              </span>
              <span className="text-tiny text-slate-400 mt-0.5 line-clamp-1">
                {doc.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lot / Token Selector Bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs no-print">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Select Procurement Record:</span>
          <select
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            className="rounded-lg border border-slate-200 p-1.5 font-mono font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            {lots.slice(0, 15).map(l => (
              <option key={l.id} value={l.id}>
                {l.lotNumber} • {l.farmerName} ({l.commodity} • Token {l.tokenNumber})
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 text-tiny hidden sm:inline">
          Official APMC Format with Government Seals &amp; Barcode
        </span>
      </div>

      {/* Document View Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
        {activeDocType === 'tak-patti' && (
          <TakPattiPrint lot={selectedLot} />
        )}

        {activeDocType === 'weighment' && (
          <WeighmentSlipPrint lot={selectedLot} />
        )}

        {activeDocType === 'receipt' && (
          <TakPattiPrint lot={selectedLot} />
        )}

        {activeDocType === 'payment' && (
          <PaymentVoucherPrint payment={selectedPayment} lot={selectedLot} />
        )}

        {activeDocType === 'gate-pass' && (
          <GatePassPrint lot={selectedLot} token={selectedToken} />
        )}
      </div>
    </div>
  );
}
