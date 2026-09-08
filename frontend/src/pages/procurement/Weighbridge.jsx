import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Calculator,
  Clock,
  CheckCircle2,
  Printer,
  ArrowRight
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';
import WeighmentSlipPrint from '../../components/documents/WeighmentSlipPrint';

export default function Weighbridge({ defaultTab = 'scale' }) {
  const { lots, recordWeighment } = useProcurement();
  const navigate = useNavigate();

  const activeTab = defaultTab;

  // Selected Lot for Weighment (Default LOT-2026-001)
  const [selectedLotId, setSelectedLotId] = useState('LOT-2026-001');
  const [grossWeight, setGrossWeight] = useState(4850);
  const [tareWeight, setTareWeight] = useState(1620);
  const [slipNo, setSlipNo] = useState('WB-PN-2026-4412');
  const scaleId = 'WB-SCALE-02 (Avery Weigh-Tronix 50T)';

  const [printSlipLot, setPrintSlipLot] = useState(null);

  const selectedLot = lots.find(l => l.id === selectedLotId) || lots[0];

  const pendingLots = lots.filter(l => !l.tareWeightKg || l.status === 'ARRIVED' || l.status === 'WEIGHMENT' || l.status === 'WEIGHING_GROSS');
  const historyLots = lots.filter(l => (l.tareWeightKg && l.tareWeightKg > 0) || l.status === 'ACCEPTED' || l.status === 'COMPLETED');

  // Dynamic calculation
  const netWeight = Math.max(0, grossWeight - tareWeight);
  const quantityQuintals = +(netWeight / 100).toFixed(2);
  const bagCount = Math.round(netWeight / 50);

  const handleSaveWeighment = (e) => {
    e.preventDefault();
    recordWeighment(selectedLot.id, {
      grossKg: grossWeight,
      tareKg: tareWeight,
      slipNo,
      scaleId
    });
    setPrintSlipLot({
      ...selectedLot,
      grossWeightKg: grossWeight,
      tareWeightKg: tareWeight,
      netWeightKg: netWeight,
      quantityQuintals: quantityQuintals,
      weighment: {
        grossKg: grossWeight,
        tareKg: tareWeight,
        netKg: netWeight,
        weighbridgeSlipNo: slipNo,
        scaleId
      }
    });
  };

  const handleLoadLotOntoScale = (lot) => {
    setSelectedLotId(lot.id);
    setGrossWeight(lot.grossWeightKg || 4850);
    setTareWeight(lot.tareWeightKg || 1620);
    navigate('/procurement/weighbridge');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Electronic Weighbridge Module</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified Avery Weigh-Tronix electronic gross &amp; tare weighing station with instant net calculation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            Bridge Scale #02 Calibrated
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <div className="flex gap-2">
          <Link
            to="/procurement/weighbridge"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'scale'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="size-3.5" />
            <span>Weighbridge Console</span>
          </Link>
          <Link
            to="/procurement/weighbridge/pending"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="size-3.5" />
            <span>Pending Weighments ({pendingLots.length})</span>
          </Link>
          <Link
            to="/procurement/weighbridge/history"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Weighment History ({historyLots.length})</span>
          </Link>
        </div>
      </div>

      {/* Pending Weighments Queue Tab View */}
      {activeTab === 'pending' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Weighment Queue</h3>
              <p className="text-xs text-slate-500">Vehicles in yard awaiting Gross or Tare weight certification</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800">
              {pendingLots.length} Vehicles in Queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Token #</th>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3 text-right">Gross (kg)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No vehicles currently pending weighment in queue.
                    </td>
                  </tr>
                ) : (
                  pendingLots.map(lot => (
                    <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{lot.tokenNumber}</td>
                      <td className="px-4 py-3 font-mono text-slate-900">{lot.lotNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{lot.farmerName}</td>
                      <td className="px-4 py-3 font-mono">{lot.vehicleNumber}</td>
                      <td className="px-4 py-3">{lot.commodity}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {lot.grossWeightKg ? `${lot.grossWeightKg.toLocaleString()} kg` : 'Pending Gross'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lot.status} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleLoadLotOntoScale(lot)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-tiny font-bold text-white hover:bg-emerald-700 shadow-xs"
                        >
                          <span>Weigh on Scale</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weighment History Tab View */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Certified Weighment History</h3>
              <p className="text-xs text-slate-500">Official log of Avery certified gross, tare, and net weights</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
              {historyLots.length} Weighments Completed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Slip #</th>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Tare</th>
                  <th className="px-4 py-3 text-right">Net Weight</th>
                  <th className="px-4 py-3 text-right">Net Qtl</th>
                  <th className="px-4 py-3 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLots.slice(0, 15).map(lot => (
                  <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{lot.weighment?.weighbridgeSlipNo || 'WB-PN-4412'}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700">{lot.lotNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{lot.farmerName}</td>
                    <td className="px-4 py-3 font-mono">{lot.vehicleNumber}</td>
                    <td className="px-4 py-3">{lot.commodity}</td>
                    <td className="px-4 py-3 text-right font-mono">{lot.grossWeightKg?.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-right font-mono">{lot.tareWeightKg?.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">
                      {lot.netWeightKg?.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {lot.quantityQuintals} Qtl
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setPrintSlipLot(lot)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-tiny font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        <Printer className="size-3 text-slate-500" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Weighment Console Grid */}
      {activeTab === 'scale' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form and Electronic Weight Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Digital Scale LED Visual Display */}
          <div className="rounded-3xl border-2 border-slate-900 bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="size-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {scaleId}
                </span>
              </div>
              <span className="text-tiny font-mono rounded bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 text-emerald-400 font-bold">
                ZERO STABLE • LIVE READOUT
              </span>
            </div>

            {/* Big LED Net Weight Screen */}
            <div className="my-6 text-center">
              <span className="text-tiny font-bold uppercase tracking-widest text-slate-400 block">
                CERTIFIED NET WEIGHT
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {netWeight.toLocaleString()}
                </span>
                <span className="text-xl font-bold font-mono text-emerald-300">KG</span>
              </div>
              <p className="text-sm font-bold text-amber-300 font-mono mt-1">
                = {quantityQuintals} Quintals ({bagCount} Standard 50kg Bags)
              </p>
            </div>

            {/* Visual Formula Math Card (Section 18) */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 text-center text-xs">
              <div>
                <span className="text-tiny text-slate-400 uppercase font-bold block">1. Gross Weight</span>
                <span className="text-lg font-bold font-mono text-slate-100">{grossWeight.toLocaleString()} kg</span>
                <span className="text-tiny text-slate-500 block">Vehicle + Produce</span>
              </div>
              <div className="flex items-center justify-center font-bold text-slate-500 text-lg">
                –
              </div>
              <div>
                <span className="text-tiny text-slate-400 uppercase font-bold block">2. Tare Weight</span>
                <span className="text-lg font-bold font-mono text-slate-100">{tareWeight.toLocaleString()} kg</span>
                <span className="text-tiny text-slate-500 block">Empty Vehicle Weight</span>
              </div>
            </div>
          </div>

          {/* Weighment Entry Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calculator className="size-4 text-emerald-600" />
              Weighment Certification Entry
            </h3>

            <form onSubmit={handleSaveWeighment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Lot for Weighing</label>
                  <select
                    value={selectedLotId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedLotId(id);
                      const lot = lots.find(l => l.id === id);
                      if (lot) {
                        setGrossWeight(lot.grossWeightKg || 4850);
                        setTareWeight(lot.tareWeightKg || 1620);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs font-bold text-slate-900"
                  >
                    {lots.slice(0, 12).map(l => (
                      <option key={l.id} value={l.id}>
                        {l.lotNumber} • {l.farmerName} ({l.commodity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weighbridge Scale Slip Number</label>
                  <input
                    type="text"
                    value={slipNo}
                    onChange={(e) => setSlipNo(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gross Weight (Loaded kg) *</label>
                  <input
                    type="number"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tare Weight (Empty Vehicle kg) *</label>
                  <input
                    type="number"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Scale Operator: <strong>Sunil G. Bhalerao (Certified)</strong>
                </span>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  Certify Weighment &amp; Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Selected Lot Particulars Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400">
              Target Lot Overview
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {selectedLot.lotNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Farmer: <strong>{selectedLot.farmerName}</strong> ({selectedLot.farmerId})
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Token Number:</span>
              <strong className="font-mono text-emerald-800">{selectedLot.tokenNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Vehicle:</span>
              <strong className="font-mono">{selectedLot.vehicleNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Commodity:</span>
              <strong>{selectedLot.commodity}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Quality Grade:</span>
              <strong className="text-emerald-700">Grade {selectedLot.assay?.grade || 'A'} (Passed)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Status:</span>
              <StatusBadge status={selectedLot.status} size="xs" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-tiny text-slate-600">
            ★ <strong>Demo Walkthrough:</strong> Certifying weighment calculates <strong>Net Weight = {netWeight} kg ({quantityQuintals} Qtl)</strong> and automatically transitions the lot into <strong>ACCEPTED</strong> state.
          </div>
        </div>
      </div>
      )}

      {/* Printable Weighment Slip Modal */}
      {printSlipLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <WeighmentSlipPrint lot={printSlipLot} />
            <div className="mt-4 text-center no-print">
              <button
                onClick={() => setPrintSlipLot(null)}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
