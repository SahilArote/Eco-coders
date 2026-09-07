import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  Printer,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';
import { GatePassPrint } from '../../components/documents/GatePassPrint';

export default function GateEntry() {
  const {
    currentCenter,
    crops,
    farmers,
    tokens,
    checkInGate,
    bookSlot,
    showToast
  } = useProcurement();

  const [formData, setFormData] = useState({
    tokenNumber: 'A105',
    farmerId: 'F-1001',
    farmerName: 'Ramesh Patil',
    mobile: '9822101341',
    vehicleNumber: 'MH-12-AQ-4481',
    commodity: 'Wheat',
    expectedQuantityQtl: 32.0,
    gateNumber: 'Gate 2 (North Commercial)',
    arrivalTime: '09:45 AM'
  });

  const [printPassToken, setPrintPassToken] = useState(null);

  const handleCheckIn = (e) => {
    e.preventDefault();
    checkInGate(formData.tokenNumber, formData.vehicleNumber, formData.gateNumber);
    const tokenObj = tokens.find(t => t.tokenNumber === formData.tokenNumber) || {
      ...formData,
      gatePassId: 'GP-2026-' + Math.floor(1000 + Math.random() * 9000)
    };
    setPrintPassToken(tokenObj);
  };

  const handleGenerateOnSpot = (e) => {
    e.preventDefault();
    const token = bookSlot({
      centerId: currentCenter.id,
      commodity: formData.commodity,
      farmerId: formData.farmerId,
      farmerName: formData.farmerName,
      farmerMobile: formData.mobile,
      expectedQuantityQtl: formData.expectedQuantityQtl,
      vehicleNumber: formData.vehicleNumber,
      appointmentDate: '2026-03-05',
      appointmentSlot: 'On-Spot Gate Walk-in'
    });
    checkInGate(token.tokenNumber, formData.vehicleNumber, formData.gateNumber);
    setPrintPassToken(token);
  };

  const handleClear = () => {
    setFormData({
      tokenNumber: '',
      farmerId: '',
      farmerName: '',
      mobile: '',
      vehicleNumber: '',
      commodity: 'Wheat',
      expectedQuantityQtl: 25.0,
      gateNumber: 'Gate 1 (Main South)',
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  // Recent checked in vehicles
  const checkedInTokens = tokens.filter(t => t.status !== 'BOOKED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Mandi Gate Entry &amp; Check-In</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify appointments, scan digital tokens, record physical vehicle entry, and print gate entry authorization passes
        </p>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gate Entry Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="size-4 text-emerald-600" />
              Inward Gate Vehicle Check-In Form
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {currentCenter.name}
            </span>
          </div>

          <form onSubmit={handleCheckIn} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Digital Token Number (Optional for Walk-in)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.tokenNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, tokenNumber: val }));
                      // Auto-fill if matching token
                      const t = tokens.find(tok => tok.tokenNumber.toLowerCase() === val.toLowerCase());
                      if (t) {
                        setFormData(prev => ({
                          ...prev,
                          farmerId: t.farmerId,
                          farmerName: t.farmerName,
                          mobile: t.farmerMobile,
                          vehicleNumber: t.vehicleNumber,
                          commodity: t.commodity,
                          expectedQuantityQtl: t.expectedQuantityQtl
                        }));
                      }
                    }}
                    placeholder="e.g. A105"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold text-emerald-800 uppercase focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-tiny text-slate-400 font-sans">
                    Type A105 to test
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MH-12-AQ-4481"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold text-slate-900 uppercase focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.farmerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmerName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer Mobile *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farmer ID / Reg #</label>
                <input
                  type="text"
                  value={formData.farmerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmerId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commodity</label>
                <select
                  value={formData.commodity}
                  onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-800"
                >
                  {crops.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Declared Quantity (Qtl)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.expectedQuantityQtl}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedQuantityQtl: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Gate</label>
                <select
                  value={formData.gateNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, gateNumber: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="Gate 1 (Main South)">Gate 1 (Main South)</option>
                  <option value="Gate 2 (North Commercial)">Gate 2 (North Commercial)</option>
                  <option value="Gate 3 (Weighbridge In)">Gate 3 (Weighbridge In)</option>
                </select>
              </div>
            </div>

            {/* Actions Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear Form
              </button>

              <button
                type="button"
                onClick={handleGenerateOnSpot}
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                Generate On-Spot Token
              </button>

              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Confirm Check-In &amp; Issue Gate Pass
              </button>
            </div>
          </form>
        </div>

        {/* Gate Guidelines & Security Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span>Mandi Security Verification</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All agricultural commercial vehicles entering the yard must possess a valid <strong>Krishi-Setu digital token</strong> or undergo on-spot gate registration.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Security officers inspect vehicle number against token.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Weight of vehicle must be below 25 metric tonnes.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Driver issued physical or digital barcode gate pass.</span>
            </div>
          </div>

          <div className="text-tiny text-slate-500 bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200">
            ★ <strong>Demo Walkthrough:</strong> Check in <strong>Token A105</strong> (Vehicle: <strong>MH-12-AQ-4481</strong>) to advance the status to ARRIVED!
          </div>
        </div>
      </div>

      {/* Recent Gate Entries Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Mandi Gate Inward Log</h3>
            <p className="text-xs text-slate-500">Vehicles currently inside the mandi premises</p>
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {checkedInTokens.length} Vehicles Inwarded
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Vehicle Number</th>
                <th className="px-4 py-3">Farmer Name</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Gate In Time</th>
                <th className="px-4 py-3">Assigned Gate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Gate Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {checkedInTokens.slice(0, 8).map(t => (
                <tr key={t.tokenNumber} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                    {t.tokenNumber}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {t.vehicleNumber}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {t.farmerName}
                  </td>
                  <td className="px-4 py-3">
                    {t.commodity} ({t.expectedQuantityQtl} Qtl)
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {t.checkInTime || '09:45 AM'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.gateNumber || 'Gate 2'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPrintPassToken(t)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-tiny font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Printer className="size-3 text-slate-500" /> Gate Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Modal */}
      {printPassToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <GatePassPrint token={printPassToken} />
            <div className="mt-4 text-center no-print">
              <button
                onClick={() => setPrintPassToken(null)}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
