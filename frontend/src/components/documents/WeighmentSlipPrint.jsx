import React from 'react';
import { Printer } from 'lucide-react';

export default function WeighmentSlipPrint({ lot }) {
  if (!lot) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Certified Weighment Slip (वजन पावती)</h3>
          <p className="text-xs text-slate-500">Avery Weigh-Tronix Electronic Bridge Scale Certificate</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Printer className="size-3.5" /> Print Slip
        </button>
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-sm print:border-black print:p-4">
        <div className="text-center border-b-2 border-slate-800 pb-3">
          <h3 className="text-base font-extrabold uppercase">{lot.centerName || 'APMC PUNE MAIN YARD'}</h3>
          <p className="text-tiny text-slate-600">ELECTRONIC WEIGHBRIDGE SYSTEM • CERTIFICATE OF GROSS / TARE / NET</p>
          <div className="mt-2 inline-block rounded bg-slate-100 border border-slate-800 px-3 py-0.5 text-xs font-bold font-mono">
            SLIP NO: {lot.weighment?.weighbridgeSlipNo || 'WB-PN-2026-4412'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200">
          <div>Farmer: <strong>{lot.farmerName}</strong> ({lot.farmerId})</div>
          <div>Vehicle: <strong className="font-mono">{lot.vehicleNumber}</strong></div>
          <div>Commodity: <strong>{lot.commodity}</strong></div>
          <div>Token: <strong className="font-mono text-emerald-800">{lot.tokenNumber}</strong></div>
        </div>

        {/* Big Weight Display */}
        <div className="my-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border-r border-slate-300">
              <span className="text-tiny uppercase text-slate-500 font-bold block">Gross Weight</span>
              <span className="text-xl font-black font-mono text-slate-900">{lot.grossWeightKg?.toLocaleString()} kg</span>
            </div>
            <div className="border-r border-slate-300">
              <span className="text-tiny uppercase text-slate-500 font-bold block">Tare Weight</span>
              <span className="text-xl font-black font-mono text-slate-600">{lot.tareWeightKg?.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-tiny uppercase text-emerald-700 font-bold block">Certified Net Weight</span>
              <span className="text-2xl font-black font-mono text-emerald-700">{lot.netWeightKg?.toLocaleString()} kg</span>
              <span className="block text-xs font-bold text-slate-700">({lot.quantityQuintals} Quintals)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
          <div>
            <p>Scale ID: <strong>{lot.weighment?.scaleId || 'Scale 02 (Avery Weigh-Tronix)'}</strong></p>
            <p>Weighed At: <strong>{lot.weighment?.weighedAt || '2026-03-05 10:35 AM'}</strong></p>
          </div>
          <div className="text-right">
            <p>Weighbridge In-charge: <strong>{lot.weighment?.weighbridgeOperator || 'Sunil G. Bhalerao'}</strong></p>
            <p className="mt-4 border-t border-slate-400 pt-1 inline-block">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
