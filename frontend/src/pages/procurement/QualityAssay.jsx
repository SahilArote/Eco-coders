import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  AlertTriangle,
  Award,
  Layers,
  Eye,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';

export default function QualityAssay({ defaultTab = 'testing' }) {
  const { lots, recordQuality } = useProcurement();
  const navigate = useNavigate();

  const activeTab = defaultTab;

  const [selectedLotId, setSelectedLotId] = useState('LOT-2026-001');
  const [moisture, setMoisture] = useState(11.2);
  const [foreignMatter, setForeignMatter] = useState(0.8);
  const [grade, setGrade] = useState('A');
  const [status, setStatus] = useState('PASSED');
  const [remarks, setRemarks] = useState('Grains are well matured, uniform size, luster bright, moisture within FAQ norms.');
  const [assayerName, setAssayerName] = useState('Dr. S. K. Mahajan (Govt Assayer #14)');

  const [inspectLot, setInspectLot] = useState(null);

  const selectedLot = lots.find(l => l.id === selectedLotId) || lots[0];

  const pendingAssayLots = lots.filter(l => !l.assay || l.assay?.status === 'QUALITY CHECK' || l.status === 'ARRIVED');

  const handleSaveAssay = (e) => {
    e.preventDefault();
    recordQuality(selectedLot.id, {
      moisturePercent: parseFloat(moisture),
      foreignMatterPercent: parseFloat(foreignMatter),
      grade,
      status,
      remarks,
      assayerName
    });
  };

  const handleLoadLotForTesting = (lot) => {
    setSelectedLotId(lot.id);
    if (lot.assay) {
      setMoisture(lot.assay.moisturePercent || 11.2);
      setForeignMatter(lot.assay.foreignMatterPercent || 0.8);
      setGrade(lot.assay.grade || 'A');
      setStatus(lot.assay.status || 'PASSED');
      setRemarks(lot.assay.remarks || 'FAQ standard passed.');
    }
    navigate('/procurement/quality');
  };

  // Grade Counts
  const gradeACount = lots.filter(l => l.assay?.grade === 'A').length;
  const gradeBCount = lots.filter(l => l.assay?.grade === 'B').length;
  const gradeCCount = lots.filter(l => l.assay?.grade === 'C').length;
  const rejectedCount = lots.filter(l => l.assay?.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quality Assessment &amp; Grading Laboratory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Standardized government laboratory testing for moisture percentage, foreign matter, and FAQ grade classification
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <div className="flex gap-2">
          <Link
            to="/procurement/quality"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'testing'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="size-3.5" />
            <span>Quality Testing</span>
          </Link>
          <Link
            to="/procurement/quality/pending"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="size-3.5" />
            <span>Pending Assays ({pendingAssayLots.length})</span>
          </Link>
          <Link
            to="/procurement/quality/history"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Assay History</span>
          </Link>
        </div>
      </div>

      {/* Pending Assays Queue View */}
      {activeTab === 'pending' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Quality Assays Queue</h3>
              <p className="text-xs text-slate-500">Produce lots staged in mandi yard awaiting laboratory sampling &amp; moisture grading</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800">
              {pendingAssayLots.length} Lots Awaiting Assay
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingAssayLots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No lots currently awaiting quality assay.
                    </td>
                  </tr>
                ) : (
                  pendingAssayLots.map(lot => (
                    <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{lot.tokenNumber}</td>
                      <td className="px-4 py-3 font-mono text-slate-900">{lot.lotNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{lot.farmerName}</td>
                      <td className="px-4 py-3 font-mono">{lot.vehicleNumber}</td>
                      <td className="px-4 py-3">{lot.commodity}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lot.status || 'QUALITY CHECK'} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleLoadLotForTesting(lot)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-tiny font-bold text-white hover:bg-emerald-700 shadow-xs"
                        >
                          <span>Test Sample</span>
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

      {/* Grade Distribution Summary Cards (active during testing) */}
      {activeTab === 'testing' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-tiny font-bold uppercase tracking-wider text-emerald-800">Grade A (Premium)</span>
            <Award className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950">{gradeACount} Lots</p>
          <span className="text-tiny text-emerald-700 font-semibold">+₹50 - ₹150 / Qtl Bonus</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-500">Grade B (Standard FAQ)</span>
            <Layers className="size-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{gradeBCount} Lots</p>
          <span className="text-tiny text-slate-500">Full MSP applicable</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-tiny font-bold uppercase tracking-wider text-amber-800">Grade C (Substandard)</span>
            <AlertTriangle className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-950">{gradeCCount} Lots</p>
          <span className="text-tiny text-amber-800">-₹40 / Qtl Deduction</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-tiny font-bold uppercase tracking-wider text-rose-800">Rejected Lots</span>
            <AlertTriangle className="size-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-950">{rejectedCount} Lots</p>
          <span className="text-tiny text-rose-700">Moisture &gt; 15% threshold</span>
        </div>
      </div>

      {/* Assay Testing Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assay Input Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="size-4 text-emerald-600" />
              Laboratory Assay Certification Form
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Mandi Assay Desk #01
            </span>
          </div>

          <form onSubmit={handleSaveAssay} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lot for Assay</label>
                <select
                  value={selectedLotId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedLotId(id);
                    const l = lots.find(item => item.id === id);
                    if (l) {
                      setMoisture(l.assay?.moisturePercent || 11.2);
                      setForeignMatter(l.assay?.foreignMatterPercent || 0.8);
                      setGrade(l.assay?.grade || 'A');
                      setStatus(l.assay?.status || 'PASSED');
                      setRemarks(l.assay?.remarks || 'FAQ standard passed.');
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs font-bold text-slate-900"
                >
                  {lots.slice(0, 15).map(l => (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} • {l.farmerName} ({l.commodity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certified Assayer Name</label>
                <input
                  type="text"
                  value={assayerName}
                  onChange={(e) => setAssayerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moisture Level (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={moisture}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMoisture(val);
                    if (val > 14.5) {
                      setStatus('FAILED');
                      setGrade('C');
                    } else if (val <= 11.5) {
                      setStatus('PASSED');
                      setGrade('A');
                    } else {
                      setStatus('PASSED');
                      setGrade('B');
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs font-bold"
                />
                <span className="text-tiny text-slate-400 mt-1 block">Govt FAQ ceiling: 12.0%</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Foreign Matter (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={foreignMatter}
                  onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs font-bold"
                />
                <span className="text-tiny text-slate-400 mt-1 block">Max permissible: 1.5%</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Grade *</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-emerald-800"
                >
                  <option value="A">Grade A (Premium FAQ + Bonus)</option>
                  <option value="B">Grade B (Standard FAQ)</option>
                  <option value="C">Grade C (Substandard Deduction)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assay Verdict</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-900"
                >
                  <option value="PASSED">PASSED FAQ STANDARDS</option>
                  <option value="FAILED">FAILED (EXCEEDS MOISTURE CEILING)</option>
                  <option value="RE-ASSESSMENT REQUIRED">RE-ASSESSMENT REQUIRED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assayer Technical Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Submit Certified Quality Assay
              </button>
            </div>
          </form>
        </div>

        {/* Selected Lot Quality Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-tiny font-bold uppercase tracking-wider text-slate-400">
              Sample Particulars
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {selectedLot.lotNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedLot.farmerName} • <strong>{selectedLot.commodity}</strong>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Vehicle:</span>
              <strong className="font-mono">{selectedLot.vehicleNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Declared Quantity:</span>
              <strong>{selectedLot.quantityQuintals} Quintals</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Grade:</span>
              <strong className="text-emerald-700 font-bold">Grade {selectedLot.assay?.grade || 'A'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Verdict Status:</span>
              <StatusBadge status={selectedLot.assay?.status || 'PASSED'} size="xs" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-tiny text-slate-600 leading-relaxed">
            ★ <strong>Demo Walkthrough:</strong> Submitting <strong>Grade A Passed</strong> unlocks the next milestone in the procurement state machine: <strong>WEIGHMENT</strong>.
          </div>
        </div>
      </div>
        </>
      )}

      {/* Assay Test Registry Table */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Laboratory Assay Test Records</h3>
            <span className="text-xs text-slate-500">Government FAQ Certified Testing Log</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3 text-center">Moisture %</th>
                  <th className="px-4 py-3 text-center">Foreign Matter %</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3">Assayer</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lots.slice(0, 15).map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{l.lotNumber}</td>
                    <td className="px-4 py-3 font-medium">{l.farmerName}</td>
                    <td className="px-4 py-3">{l.commodity}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">{l.assay?.moisturePercent}%</td>
                    <td className="px-4 py-3 text-center font-mono">{l.assay?.foreignMatterPercent}%</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-800">
                      Grade {l.assay?.grade || 'A'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{l.assay?.assayerName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.assay?.status || 'PASSED'} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setInspectLot(l)}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(inspectLot)}
        onClose={() => setInspectLot(null)}
        title={inspectLot ? `Assay Certificate: ${inspectLot.lotNumber}` : 'Assay Details'}
        subtitle={`Farmer: ${inspectLot?.farmerName} • Commodity: ${inspectLot?.commodity}`}
      >
        {inspectLot && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-bold text-slate-900 mb-2">Test Findings</h4>
              <p>Moisture Content: <strong>{inspectLot.assay?.moisturePercent}%</strong></p>
              <p>Foreign Matter: <strong>{inspectLot.assay?.foreignMatterPercent}%</strong></p>
              <p>Grade: <strong className="text-emerald-700">Grade {inspectLot.assay?.grade}</strong></p>
              <p>Assayed Date: <strong>{inspectLot.assay?.assayedAt}</strong></p>
              <p>Remarks: <em>{inspectLot.assay?.remarks}</em></p>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
