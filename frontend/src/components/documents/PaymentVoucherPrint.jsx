import React from 'react';
import { Printer } from 'lucide-react';

export function GatePassPrint({ lot, token }) {
  const item = lot || token;
  if (!item) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">APMC Gate Pass (गेट पास)</h3>
          <p className="text-xs text-slate-500">Authorized Inward Security & Vehicle Clearance Slip</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Printer className="size-3.5" /> Print Gate Pass
        </button>
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-sm print:border-black print:p-4">
        <div className="text-center border-b-2 border-slate-800 pb-3">
          <h3 className="text-base font-black uppercase">APMC SECURITY INWARD DIVISION</h3>
          <p className="text-tiny font-bold text-slate-600">INWARD GATE AUTHORIZATION PASS</p>
          <div className="mt-2 inline-block rounded border border-slate-800 bg-slate-100 px-3 py-0.5 text-sm font-mono font-bold">
            PASS: {item.gatePassId || 'GP-2026-0912'}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
          <div>
            <span className="text-slate-500 block">Token Number:</span>
            <strong className="text-lg font-mono text-emerald-700">{item.tokenNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Vehicle Number:</span>
            <strong className="text-lg font-mono">{item.vehicleNumber || 'MH-12-AQ-4481'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Farmer Name:</span>
            <strong>{item.farmerName}</strong> ({item.farmerId})
          </div>
          <div>
            <span className="text-slate-500 block">Commodity Declared:</span>
            <strong>{item.commodity}</strong> ({item.expectedQuantityQtl || item.quantityQuintals} Qtl)
          </div>
          <div>
            <span className="text-slate-500 block">Arrival Timestamp:</span>
            <strong>{item.gateEntryTime || item.checkInTime || '2026-03-05 09:45 AM'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Gate Assigned:</span>
            <strong>{item.gateNumber || 'Gate 2 (North Commercial)'}</strong>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="font-mono text-xs tracking-widest text-slate-800 py-1 border border-slate-300 bg-slate-50 rounded">
            *||||| KRISHI-SETU-GATE-PASS-AUTH |||||*
          </div>
          <p className="text-tiny text-slate-500 mt-2">
            Valid only on date of issue. Driver must retain this slip until final Gate-Out Weighment.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentVoucherPrint({ payment, lot }) {
  const p = payment || lot;
  if (!p) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">PFMS DBT Payment Voucher (ई-पेमेंट पावती)</h3>
          <p className="text-xs text-slate-500">Public Financial Management System Electronic Direct Benefit Transfer</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Printer className="size-3.5" /> Print Voucher
        </button>
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-sm print:border-black print:p-4">
        <div className="text-center border-b-2 border-slate-800 pb-3">
          <h3 className="text-base font-black uppercase">GOVERNMENT OF MAHARASHTRA • APMC DBT DISBURSEMENT</h3>
          <p className="text-tiny font-bold text-slate-600">PFMS DIRECT BENEFIT TRANSFER CREDIT CERTIFICATE</p>
          <div className="mt-2 inline-block rounded border border-slate-800 bg-emerald-50 px-3 py-0.5 text-xs font-mono font-bold text-emerald-800">
            REF: {p.paymentRef || 'PFMS-2026-MH-8921034'}
          </div>
        </div>

        <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
          <span className="text-tiny uppercase tracking-wider text-emerald-800 font-bold block">
            Net Credited Amount to Farmer Bank
          </span>
          <span className="text-3xl font-black font-mono text-emerald-900">
            ₹{(p.finalAmount || p.financials?.netPayableAmount)?.toLocaleString('en-IN') || '79,942.50'}
          </span>
          <span className="block text-xs font-semibold text-emerald-700 mt-1">
            Status: DBT Settled & Approved
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-200 py-3">
          <div>Beneficiary: <strong>{p.farmerName}</strong> ({p.farmerId})</div>
          <div>Bank: <strong>{p.bankName || 'State Bank of India'}</strong></div>
          <div>Account: <strong className="font-mono">{p.accountMasked || '••••••••5412'}</strong></div>
          <div>IFSC: <strong className="font-mono">{p.ifsc || 'SBIN0001423'}</strong></div>
          <div>UTR Reference: <strong className="font-mono">{p.utrNumber || 'UTR-SBI-20260305-998812'}</strong></div>
          <div>Settlement Date: <strong>{p.disbursedAt || '2026-03-05 11:22 AM'}</strong></div>
        </div>

        <div className="mt-4 text-xs text-slate-500 flex justify-between items-center">
          <span>Certified by APMC Finance Officer</span>
          <span className="font-mono text-tiny">Simulated Production Voucher • Krishi-Setu DBT Engine</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentVoucherPrint;

