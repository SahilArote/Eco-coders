import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  ShieldCheck 
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function QualityAssayerDashboard() {
  const { lots, currentCenter, recordQuality, showToast, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/quality
  useEffect(() => {
    if (currentRole !== 'quality_assayer') {
      setCurrentRole('quality_assayer');
    }
  }, [currentRole, setCurrentRole]);

  // Selected lot for assaying
  const [selectedLot, setSelectedLot] = useState(lots[1] || lots[0]);

  // Form parameters
  const [moisture, setMoisture] = useState(selectedLot?.assay?.moisturePercent || 11.2);
  const [foreignMatter, setForeignMatter] = useState(selectedLot?.assay?.foreignMatterPercent || 0.8);
  const [shriveled, setShriveled] = useState(selectedLot?.assay?.shriveledGrainsPercent || 1.1);
  const [remarks, setRemarks] = useState(selectedLot?.assay?.remarks || 'Grain clean, lustrous, meets FAQ moisture norms.');

  // Evaluated grade
  const isMoistureOk = Number(moisture) <= 12.0;
  const isForeignOk = Number(foreignMatter) <= 1.5;
  const isShriveledOk = Number(shriveled) <= 3.0;

  const autoGrade = isMoistureOk && isForeignOk && isShriveledOk ? 'A' : (Number(moisture) <= 14.0 ? 'B' : 'REJECTED');
  const autoStatus = autoGrade === 'REJECTED' ? 'FAILED' : 'PASSED';

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    setMoisture(lot.assay?.moisturePercent || 11.4);
    setForeignMatter(lot.assay?.foreignMatterPercent || 0.8);
    setShriveled(lot.assay?.shriveledGrainsPercent || 1.2);
    setRemarks(lot.assay?.remarks || 'Grain sample inspected against FAQ norms.');
  };

  const handleSubmitAssay = (statusOverride) => {
    if (!selectedLot) return;
    const finalStatus = statusOverride || autoStatus;
    const finalGrade = finalStatus === 'FAILED' ? 'REJECTED' : autoGrade;

    recordQuality(selectedLot.id, {
      moisturePercent: Number(moisture),
      foreignMatterPercent: Number(foreignMatter),
      shriveledGrainsPercent: Number(shriveled),
      grade: `Grade ${finalGrade}`,
      status: finalStatus,
      assayerName: 'Dr. S. K. Mahajan (Govt Assayer #14)',
      remarks
    });

    showToast(`Assay for Lot ${selectedLot.lotNumber}: ${finalGrade} (${finalStatus})`);
  };

  const testedCount = lots.filter(l => l.assay && l.assay.status === 'PASSED').length;
  const pendingCount = lots.filter(l => !l.assay || l.assay.status !== 'PASSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-xs font-bold">
              LAB BENCH A
            </span>
            <span className="text-xs text-slate-400">• Moisture Probe & FAQ Grading Station</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Quality & Assay Officer Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Government MSP Fair Average Quality (FAQ) Standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            <FlaskConical className="w-3.5 h-3.5" />
            Electronic Moisture Meter: Calibrated
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Quality Assayer Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Samples Today"
          value={testedCount}
          sublabel="Certified FAQ batches tested"
          icon={FlaskConical}
          color="emerald"
        />
        <MetricCard
          title="Pending Quality Checks"
          value={pendingCount}
          sublabel="Inward lots staged for assay"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Approved Lots"
          value={lots.filter(l => l.assay && l.assay.status === 'PASSED').length}
          sublabel="FAQ Grade A / B certified"
          icon={CheckCircle2}
          color="sky"
        />
        <MetricCard
          title="Rejected Lots"
          value={lots.filter(l => l.assay && l.assay.status === 'FAILED').length}
          sublabel="High moisture / foreign matter"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Lab Testing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Testing Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm">Lab Test Bench</h3>
            </div>
            <span className="font-mono text-[10px] text-slate-400">FAQ Norms 2026</span>
          </div>

          {/* Active Target Card */}
          {selectedLot ? (
            <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900">Lot: {selectedLot.lotNumber}</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">Token {selectedLot.tokenNumber}</span>
              </div>
              <p className="text-slate-600">Farmer: <strong className="text-slate-800">{selectedLot.farmerName}</strong></p>
              <p className="text-slate-500 text-[11px]">Commodity: {selectedLot.commodity} ({selectedLot.variety})</p>
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400">
              Select an inward lot to test
            </div>
          )}

          {/* Auto Grade Indicator */}
          <div className={`p-4 rounded-xl border text-center space-y-1 ${
            autoGrade === 'A' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : autoGrade === 'B' 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider block">
              EVALUATED QUALITY GRADE
            </span>
            <div className="text-3xl font-black">
              GRADE {autoGrade}
            </div>
            <span className="text-xs font-semibold block">
              {autoStatus === 'PASSED' ? 'Meets Fair Average Quality (FAQ)' : 'Failed: Moisture Exceeds Mandi Limit'}
            </span>
          </div>

          {/* Test Parameter Inputs */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Moisture Content (%)</label>
                <span className={`text-[10px] font-bold ${isMoistureOk ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Max Limit: 12.0%
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg font-mono font-bold text-slate-800 text-sm focus:outline-none ${
                  isMoistureOk ? 'border-slate-200 focus:border-emerald-500' : 'border-rose-300 bg-rose-50/50'
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Foreign Matter (%)</label>
                <span className={`text-[10px] font-bold ${isForeignOk ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Max Limit: 1.5%
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={foreignMatter}
                onChange={(e) => setForeignMatter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Shriveled / Immature Grains (%)</label>
                <span className="text-[10px] text-slate-400">Max Limit: 3.0%</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={shriveled}
                onChange={(e) => setShriveled(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assay Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSubmitAssay('FAILED')}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Sample</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmitAssay('PASSED')}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Certify FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assay Inspection Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Laboratory Sample Inspection Queue</h3>
                <p className="text-[11px] text-slate-400">Click any inward lot to load into the testing bench.</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                Wheat Moisture Standard: $\le 12.0\%$
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="pb-2.5">Lot ID</th>
                    <th className="pb-2.5">Farmer Name</th>
                    <th className="pb-2.5">Commodity</th>
                    <th className="pb-2.5">Moisture (%)</th>
                    <th className="pb-2.5">Foreign Matter</th>
                    <th className="pb-2.5">Grade</th>
                    <th className="pb-2.5 text-right">Assay Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lots.slice(0, 8).map((lot) => {
                    const isSelected = selectedLot?.id === lot.id;
                    const m = lot.assay?.moisturePercent;
                    const g = lot.assay?.grade || 'Grade A';

                    return (
                      <tr
                        key={lot.id}
                        onClick={() => handleSelectLot(lot)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50/60 font-semibold' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-2.5">
                          <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {lot.lotNumber}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="text-slate-900 block">{lot.farmerName}</span>
                          <span className="text-[10px] text-slate-400">Token {lot.tokenNumber}</span>
                        </td>
                        <td className="py-2.5 text-slate-700">
                          {lot.commodity}
                        </td>
                        <td className="py-2.5 font-mono">
                          <span className={m > 12.0 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                            {m ? `${m}%` : '11.4%'}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-700">
                          {lot.assay?.foreignMatterPercent || 0.8}%
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {g}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <StatusBadge status={lot.assay?.status === 'PASSED' ? 'ACCEPTED' : 'QUALITY_CHECK'} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing recent inward lots for laboratory grading</span>
            <span className="font-semibold text-sky-700">Govt Assay Officer Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
