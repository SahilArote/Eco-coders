import { Printer } from 'lucide-react';

export default function TakPattiPrint({ lot }) {
  if (!lot) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Mandi Tak-Patti (Form J)</h3>
          <p className="text-xs text-slate-500">Official APMC Procurement & Auction Settlement Slip</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Printer className="size-3.5" /> Print Form J
          </button>
        </div>
      </div>

      {/* Printable Voucher Paper */}
      <div className="rounded-xl border-2 border-slate-800 bg-white p-8 text-slate-900 shadow-sm print:border-black print:p-4 print:shadow-none print-break-inside-avoid">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Government of Maharashtra • Department of Agriculture Marketing
            </span>
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
            {lot.centerName || 'AGRICULTURAL PRODUCE MARKET COMMITTEE (APMC) PUNE'}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Mandi Yard: Gultekdi, Market Yard, Pune - 411037 | Mandi Reg No: APMC/MH/PUN/2026-9812
          </p>
          <div className="mt-3 inline-block rounded border border-slate-800 px-4 py-1 text-sm font-black tracking-wider uppercase bg-slate-100 print:bg-transparent">
            MANDI TAK-PATTI / FORM J (तुकडा पावती)
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-300 pb-3 text-xs">
          <div>
            <span className="text-slate-500 block text-tiny">Tak-Patti Slip No:</span>
            <strong className="font-mono text-sm">{lot.gatePassId || 'TP-2026-0912'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-tiny">Token Number:</span>
            <strong className="font-mono text-sm text-emerald-800">{lot.tokenNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-tiny">Procurement Date:</span>
            <strong>{lot.gateEntryTime || '2026-03-05 10:00 AM'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-tiny">Lot ID:</span>
            <strong className="font-mono">{lot.lotNumber || lot.id}</strong>
          </div>
        </div>

        {/* Farmer & Vehicle Info */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-300 pb-4 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 print:bg-transparent">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-tiny border-b border-slate-200 pb-1 mb-2">
              Farmer Particulars (शेतकऱ्याचा तपशील)
            </h4>
            <div className="space-y-1">
              <p>Name: <strong>{lot.farmerName}</strong> (ID: {lot.farmerId})</p>
              <p>Village/Taluka: <strong>{lot.village || 'Khed Shivapur'}, {lot.district || 'Pune'}</strong></p>
              <p>Mobile: <strong>+91 {lot.farmerMobile || '9822101341'}</strong></p>
              <p>Aadhaar (Masked): <strong>XXXX-XXXX-3412 (KYC Verified)</strong></p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 print:bg-transparent">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-tiny border-b border-slate-200 pb-1 mb-2">
              Logistics & Scale Particulars
            </h4>
            <div className="space-y-1">
              <p>Vehicle Number: <strong>{lot.vehicleNumber}</strong></p>
              <p>Vehicle Type: <strong>{lot.vehicleType || 'Tractor Trolley'}</strong></p>
              <p>Weighbridge Scale: <strong>{lot.weighment?.scaleId || 'Scale 02 (Avery)'}</strong></p>
              <p>Weighment Slip Ref: <strong>{lot.weighment?.weighbridgeSlipNo || 'WB-PN-4412'}</strong></p>
            </div>
          </div>
        </div>

        {/* Commodity & Quality Breakdown */}
        <div className="mt-4">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300 print:bg-transparent">
              <tr>
                <th className="p-2 border-r border-slate-300">Commodity</th>
                <th className="p-2 border-r border-slate-300">Moisture %</th>
                <th className="p-2 border-r border-slate-300">Grade</th>
                <th className="p-2 border-r border-slate-300 text-right">Gross Wt (kg)</th>
                <th className="p-2 border-r border-slate-300 text-right">Tare Wt (kg)</th>
                <th className="p-2 border-r border-slate-300 text-right">Net Wt (kg)</th>
                <th className="p-2 text-right">Net (Quintal)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-r border-slate-300 font-medium">
                  {lot.commodity} ({lot.variety || 'FAQ Standard'})
                </td>
                <td className="p-2 border-r border-slate-300">{lot.assay?.moisturePercent || 11.2}%</td>
                <td className="p-2 border-r border-slate-300 font-bold text-emerald-700">
                  Grade {lot.assay?.grade || 'A'}
                </td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">{lot.grossWeightKg?.toLocaleString()}</td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">{lot.tareWeightKg?.toLocaleString()}</td>
                <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-slate-900">{lot.netWeightKg?.toLocaleString()}</td>
                <td className="p-2 text-right font-mono font-bold text-slate-900">{lot.quantityQuintals} Qtl</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Billing Calculation */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-300 pt-3">
          <div className="text-xs space-y-1 text-slate-600">
            <p><strong>Pricing Basis:</strong> Govt Minimum Support Price (MSP) Rabi 2026</p>
            <p>Assayer Certification: <strong>{lot.assay?.assayerName || 'Dr. S. K. Mahajan (Govt Assayer #14)'}</strong></p>
            <p className="text-tiny">Payment Mode: Direct Benefit Transfer (PFMS DBT) to Bank Account</p>
            {lot.paymentRef && (
              <p className="text-tiny text-emerald-800 font-bold">
                DBT Reference No: {lot.paymentRef}
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs space-y-1.5 print:bg-transparent">
            <div className="flex justify-between">
              <span>Notified MSP Rate:</span>
              <span className="font-mono">₹{lot.financials?.mspRate?.toLocaleString() || '2,425.00'} / Qtl</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Quality Grade Bonus:</span>
              <span className="font-mono">+₹{lot.financials?.qualityBonusRate || 50}.00 / Qtl</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-slate-200 pt-1">
              <span>Effective Rate / Qtl:</span>
              <span className="font-mono">₹{lot.financials?.effectiveRatePerQtl?.toLocaleString() || '2,475.00'}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Deductions (Cess/Handling):</span>
              <span className="font-mono">-₹{lot.financials?.deductions?.totalDeductions || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t-2 border-slate-800 pt-1.5 text-slate-900">
              <span>Net Payable to Farmer:</span>
              <span className="font-mono text-emerald-800">₹{lot.financials?.netPayableAmount?.toLocaleString('en-IN') || '79,942.50'}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs border-t border-dashed border-slate-400 pt-6">
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1 font-semibold">Farmer Signature / Thumb</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1 font-semibold">Weighbridge Operator</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1 font-semibold">APMC Mandi Secretary</p>
          </div>
        </div>

        {/* Footer Barcode Placeholder */}
        <div className="mt-6 text-center border-t border-slate-200 pt-3 flex items-center justify-between text-tiny text-slate-400">
          <span>Kraya Sutra DIGITAL VERIFICATION SEAL • MH-AGRI-SEC-2026</span>
          <span className="font-mono font-bold tracking-widest text-slate-700">||||| | |||| |||||| | ||||| ||||</span>
          <span>System Generated • No Physical Alteration Valid</span>
        </div>
      </div>
    </div>
  );
}
