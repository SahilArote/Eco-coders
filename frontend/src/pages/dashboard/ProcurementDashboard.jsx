import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Search, 
  TrendingUp, 
  Building2,
  Printer,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';
import TakPattiPrint from '../../components/documents/TakPattiPrint';

export default function ProcurementDashboard() {
  const { lots, currentCenter, completeLot, showToast, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/procurement
  useEffect(() => {
    if (currentRole !== 'procurement_officer') {
      setCurrentRole('procurement_officer');
    }
  }, [currentRole, setCurrentRole]);

  const [selectedLotForDrawer, setSelectedLotForDrawer] = useState(null);
  const [printLot, setPrintLot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('ALL');

  const handleApproveLot = (lotId) => {
    completeLot(lotId);
    if (selectedLotForDrawer?.id === lotId) {
      setSelectedLotForDrawer(prev => ({ ...prev, status: 'COMPLETED' }));
    }
  };

  const filteredLots = lots.filter(l => {
    const matchesSearch = l.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommodity = commodityFilter === 'ALL' || l.commodity === commodityFilter;
    return matchesSearch && matchesCommodity;
  });

  const totalProcuredQtl = lots.reduce((acc, l) => acc + (l.quantityQuintals || 0), 0).toFixed(1);
  const totalApprovedValue = lots.reduce((acc, l) => acc + (l.financials?.netPayableAmount || 0), 0);
  const pendingApprovalsCount = lots.filter(l => l.status === 'ACCEPTED').length;
  const completedLotsCount = lots.filter(l => l.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">
              PROCUREMENT CELL
            </span>
            <span className="text-xs text-slate-400">• Mandi Clearance & Lot Approvals</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Procurement Officer Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Statutory Quota Monitoring, Clearance Approvals & Mandi Tak-Patti (Form J)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <PackageCheck className="w-3.5 h-3.5" />
            Clearance Cell Operational
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Procurement Officer Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Procurement"
          value={`${totalProcuredQtl} Qtl`}
          sublabel="Current KMS intake volume"
          icon={PackageCheck}
          color="emerald"
        />
        <MetricCard
          title="Active Procurement Lots"
          value={pendingApprovalsCount}
          sublabel="Weighed lots awaiting clearance"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Approved Lots"
          value={completedLotsCount}
          sublabel="Cleared & Tak-Patti Form J issued"
          icon={CheckCircle2}
          color="sky"
        />
        <MetricCard
          title="Procurement Value"
          value={`₹${(totalApprovedValue / 100000).toFixed(2)} Lakhs`}
          sublabel="Total statutory MSP settlement value"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Main Procurement Clearance Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Procurement Lots Clearance Ledger</h3>
            <p className="text-[11px] text-slate-400">Review weights, assay grades, and authorize Mandi Form J.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Commodities</option>
              <option value="Wheat">Wheat</option>
              <option value="Soybean">Soybean</option>
              <option value="Gram / Chana">Gram / Chana</option>
              <option value="Maize">Maize</option>
            </select>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lot, farmer, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-2.5">Lot ID</th>
                <th className="pb-2.5">Token</th>
                <th className="pb-2.5">Farmer Name</th>
                <th className="pb-2.5">Commodity</th>
                <th className="pb-2.5">Net Weight</th>
                <th className="pb-2.5">Assay Grade</th>
                <th className="pb-2.5">MSP Amount</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLots.slice(0, 10).map((lot) => {
                const amount = lot.financials?.netPayableAmount || (lot.quantityQuintals * 2475);

                return (
                  <tr key={lot.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5">
                      <span className="font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {lot.lotNumber}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-700">
                      {lot.tokenNumber}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 block">{lot.farmerName}</span>
                      <span className="text-[10px] text-slate-400">{lot.village}, {lot.district}</span>
                    </td>
                    <td className="py-2.5 text-slate-700">
                      {lot.commodity}
                    </td>
                    <td className="py-2.5 font-mono font-semibold text-slate-800">
                      {lot.quantityQuintals} Qtl
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lot.assay?.grade || 'Grade A'}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-emerald-800">
                      ₹{amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={lot.status} size="sm" />
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedLotForDrawer(lot)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-800 bg-slate-100 hover:bg-indigo-50 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>

                      <button
                        onClick={() => setPrintLot(lot)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-800 bg-slate-100 hover:bg-indigo-50 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Form J
                      </button>

                      {lot.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleApproveLot(lot.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Approve
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
          <span>Showing {Math.min(filteredLots.length, 10)} of {lots.length} procurement records</span>
          <span className="font-semibold text-indigo-700">Procurement Quota Utilization: 84%</span>
        </div>
      </div>

      {/* Lot Inspection Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedLotForDrawer)}
        onClose={() => setSelectedLotForDrawer(null)}
        title={`Lot Inspection: ${selectedLotForDrawer?.lotNumber || ''}`}
      >
        {selectedLotForDrawer && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
              <span className="text-indigo-900 font-bold block text-sm">Procurement Summary</span>
              <p className="text-slate-600">Farmer: <strong className="text-slate-900">{selectedLotForDrawer.farmerName}</strong> ({selectedLotForDrawer.farmerId})</p>
              <p className="text-slate-600">Location: {selectedLotForDrawer.village}, {selectedLotForDrawer.district}</p>
              <p className="text-slate-600">Commodity: {selectedLotForDrawer.commodity} ({selectedLotForDrawer.variety})</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Weighment</span>
                <strong className="text-slate-800 text-sm font-mono">{selectedLotForDrawer.quantityQuintals} Qtl</strong>
                <span className="text-[11px] text-slate-500 block">Gross: {selectedLotForDrawer.grossWeightKg} kg • Tare: {selectedLotForDrawer.tareWeightKg} kg</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Quality Assay</span>
                <strong className="text-emerald-700 text-sm">{selectedLotForDrawer.assay?.grade || 'Grade A'}</strong>
                <span className="text-[11px] text-slate-500 block">Moisture: {selectedLotForDrawer.assay?.moisturePercent || 11.2}%</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-emerald-900 font-bold block">Financial Calculation</span>
              <div className="flex justify-between items-center text-slate-700">
                <span>Effective Rate:</span>
                <strong className="font-mono">₹{selectedLotForDrawer.financials?.effectiveRatePerQtl || 2475} / Qtl</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Gross Procurement Value:</span>
                <strong className="font-mono">₹{selectedLotForDrawer.financials?.grossValue?.toLocaleString('en-IN') || '79,942.50'}</strong>
              </div>
              <div className="flex justify-between items-center text-emerald-800 font-bold border-t border-emerald-200 pt-1">
                <span>Net Payable to Farmer:</span>
                <span className="text-base font-mono">₹{selectedLotForDrawer.financials?.netPayableAmount?.toLocaleString('en-IN') || '79,942.50'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setPrintLot(selectedLotForDrawer);
                  setSelectedLotForDrawer(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Form J
              </button>
              {selectedLotForDrawer.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleApproveLot(selectedLotForDrawer.id)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Lot
                </button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Form J Tak-Patti Printable Modal */}
      {printLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <TakPattiPrint lot={printLot} />
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPrintLot(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Print Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
