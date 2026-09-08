import { useState, useEffect } from 'react';
import { 
  Scale, 
  Truck, 
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import WeighmentSlipPrint from '../../components/documents/WeighmentSlipPrint';

export default function WeighbridgeDashboard() {
  const { lots, currentCenter, recordWeighment, showToast, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/weighbridge
  useEffect(() => {
    if (currentRole !== 'weighbridge_operator') {
      setCurrentRole('weighbridge_operator');
    }
  }, [currentRole, setCurrentRole]);

  // Selected lot for weighing operation
  const [selectedLot, setSelectedLot] = useState(lots[0] || null);

  // Form values
  const [grossInput, setGrossInput] = useState(selectedLot?.grossWeightKg || 4850);
  const [tareInput, setTareInput] = useState(selectedLot?.tareWeightKg || 1620);
  const [scaleId, setScaleId] = useState('WB-SCALE-02 (Avery Weigh-Tronix)');

  // Print Slip Modal
  const [printSlipLot, setPrintSlipLot] = useState(null);

  // Active filter tab for weighment queue
  const [queueFilter, setQueueFilter] = useState('ALL'); // 'ALL' | 'GROSS_PENDING' | 'TARE_PENDING' | 'WEIGHED'

  // Computed weights
  const netWeightKg = Math.max(0, (grossInput || 0) - (tareInput || 0));
  const netQuintals = (netWeightKg / 100).toFixed(2);

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    setGrossInput(lot.grossWeightKg || 4850);
    setTareInput(lot.tareWeightKg || 0);
  };

  const handleCaptureGross = () => {
    if (!selectedLot) return;
    recordWeighment(selectedLot.id, {
      grossKg: Number(grossInput),
      tareKg: 0,
      scaleId
    });
    showToast(`Gross weight ${grossInput} kg captured for Token ${selectedLot.tokenNumber}`);
  };

  const handleCaptureTareAndFinalize = () => {
    if (!selectedLot) return;
    if (Number(tareInput) >= Number(grossInput)) {
      showToast('Tare weight must be strictly less than Gross weight!', 'error');
      return;
    }

    recordWeighment(selectedLot.id, {
      grossKg: Number(grossInput),
      tareKg: Number(tareInput),
      scaleId
    });

    const updated = {
      ...selectedLot,
      grossWeightKg: Number(grossInput),
      tareWeightKg: Number(tareInput),
      netWeightKg,
      quantityQuintals: Number(netQuintals)
    };
    setSelectedLot(updated);
    setPrintSlipLot(updated);
    showToast(`Weighment finalized: Net ${netQuintals} Qtl (${netWeightKg} kg)`);
  };

  const filteredLots = lots.filter(l => {
    if (queueFilter === 'GROSS_PENDING') return !l.grossWeightKg || l.status === 'ARRIVED';
    if (queueFilter === 'TARE_PENDING') return l.grossWeightKg && (!l.tareWeightKg || l.tareWeightKg === 0);
    if (queueFilter === 'WEIGHED') return l.tareWeightKg > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-xs font-bold">
              WEIGHBRIDGE CABIN 2
            </span>
            <span className="text-xs text-slate-400">• Electronic Avery Gross & Tare Station</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Weighbridge Operator Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Scale Calibration: Valid till Dec 2026 (±5 kg tolerance)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            Digital Indicator: Online (RS-232)
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Weighbridge Operator Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Vehicles Waiting for Weighment"
          value={lots.filter(l => !l.grossWeightKg || l.status === 'ARRIVED').length}
          sublabel="Queue at platform scale"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Completed Weighments"
          value={lots.filter(l => l.tareWeightKg > 0).length}
          sublabel="Gross & tare finalized"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Pending Weighments"
          value={lots.filter(l => l.grossWeightKg > 0 && (!l.tareWeightKg || l.tareWeightKg === 0)).length}
          sublabel="Gross captured, awaiting tare"
          icon={Truck}
          color="sky"
        />
        <MetricCard
          title="Total Net Weight"
          value="2,840 Qtl"
          sublabel="284.00 Metric Tons certified"
          icon={Scale}
          color="purple"
        />
      </div>

      {/* Interactive Scale Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scale Terminal Console */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Scale Terminal</h3>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Scale: Avery 60MT</span>
          </div>

          {/* Active Target Card */}
          {selectedLot ? (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Token {selectedLot.tokenNumber}</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">{selectedLot.vehicleNumber}</span>
              </div>
              <p className="text-slate-600">Farmer: <strong className="text-slate-800">{selectedLot.farmerName}</strong></p>
              <p className="text-slate-500 text-[11px]">Commodity: {selectedLot.commodity} ({selectedLot.variety})</p>
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400">
              Select a lot from the queue to start weighment
            </div>
          )}

          {/* Live Weight Display */}
          <div className="p-4 rounded-xl bg-slate-950 text-white font-mono text-center shadow-inner space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-sans font-bold">
              NET CALCULATED WEIGHT
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {netWeightKg.toLocaleString('en-IN')} <span className="text-lg font-normal text-slate-400">kg</span>
            </div>
            <span className="text-xs text-slate-300 font-sans block">
              = <strong className="text-white font-bold">{netQuintals} Quintals</strong> (Qtl)
            </span>
          </div>

          {/* Scale Input Forms */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">1. Gross Weight (Loaded Vehicle)</label>
                <span className="text-[10px] text-slate-400">Unit: kg</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCaptureGross}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 cursor-pointer"
                >
                  Capture Gross
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">2. Tare Weight (Empty Vehicle)</label>
                <span className="text-[10px] text-slate-400">Unit: kg</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tareInput}
                  onChange={(e) => setTareInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setTareInput(1620)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 cursor-pointer"
                >
                  Simulate Empty
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weighbridge Hardware ID</label>
              <select
                value={scaleId}
                onChange={(e) => setScaleId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
              >
                <option value="WB-SCALE-02 (Avery Weigh-Tronix)">Scale #2 — Avery Weigh-Tronix (60 MT)</option>
                <option value="WB-SCALE-01 (Mettler Toledo)">Scale #1 — Mettler Toledo (50 MT)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCaptureTareAndFinalize}
              className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Net Weight & Generate Weighment Slip</span>
            </button>
          </div>
        </div>

        {/* Weighment Queue & Ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Weighbridge Scale Queue</h3>
                <p className="text-[11px] text-slate-400">Click any vehicle to load into the active scale terminal.</p>
              </div>

              {/* Queue Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
                {[
                  { id: 'ALL', label: 'All Queue' },
                  { id: 'TARE_PENDING', label: 'Tare Pending' },
                  { id: 'WEIGHED', label: 'Completed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setQueueFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      queueFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="pb-2.5">Token</th>
                    <th className="pb-2.5">Vehicle</th>
                    <th className="pb-2.5">Farmer</th>
                    <th className="pb-2.5">Gross (kg)</th>
                    <th className="pb-2.5">Tare (kg)</th>
                    <th className="pb-2.5">Net (Qtl)</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLots.slice(0, 7).map((item) => {
                    const isSelected = selectedLot?.id === item.id;
                    const netKg = item.netWeightKg || Math.max(0, (item.grossWeightKg || 0) - (item.tareWeightKg || 0));
                    const netQ = (netKg / 100).toFixed(2);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectLot(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-2.5">
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {item.tokenNumber}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-800">
                          {item.vehicleNumber}
                        </td>
                        <td className="py-2.5">
                          <span className="text-slate-900 block">{item.farmerName}</span>
                          <span className="text-[10px] text-slate-400">{item.commodity}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-700">
                          {item.grossWeightKg ? `${item.grossWeightKg.toLocaleString()} kg` : '—'}
                        </td>
                        <td className="py-2.5 font-mono text-slate-700">
                          {item.tareWeightKg ? `${item.tareWeightKg.toLocaleString()} kg` : (
                            <span className="text-amber-600 font-bold text-[10px]">PENDING</span>
                          )}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-emerald-700">
                          {item.tareWeightKg ? `${netQ} Qtl` : '—'}
                        </td>
                        <td className="py-2.5 text-right space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintSlipLot(item);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-amber-50 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing {Math.min(filteredLots.length, 7)} lots in weighment queue</span>
            <span className="font-semibold text-emerald-700">Avery Scale #2 Verified</span>
          </div>
        </div>
      </div>

      {/* Printable Weighment Slip Modal */}
      {printSlipLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <WeighmentSlipPrint lot={printSlipLot} />
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPrintSlipLot(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Slip Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
