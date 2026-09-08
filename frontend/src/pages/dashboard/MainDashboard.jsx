import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Truck,
  Users2,
  Package,
  Scale,
  IndianRupee,
  FlaskConical,
  CreditCard,
  Calendar,
  ArrowRight,
  Plus,
  Printer,
  ChevronRight,
  Sparkles,
  Building2,
  Eye
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';
import Timeline from '../../components/common/Timeline';
import TakPattiPrint from '../../components/documents/TakPattiPrint';

export default function MainDashboard() {
  const navigate = useNavigate();
  const {
    currentCenter,
    farmers,
    tokens,
    lots,
    payments,
    counters,
    callNextToken
  } = useProcurement();

  const [selectedLot, setSelectedLot] = useState(null);
  const [printModalLot, setPrintModalLot] = useState(null);

  // Computed metrics
  const totalFarmersCount = farmers.length;
  const todayEntries = tokens.filter(t => t.status !== 'BOOKED').length;
  const activeQueueCount = tokens.filter(t => ['ARRIVED', 'WAITING', 'PROCESSING'].includes(t.status)).length;
  const todayLots = lots.filter(l => l.gateEntryTime?.includes('2026-03-05'));
  const todayProcurementQtl = todayLots.reduce((sum, l) => sum + (l.quantityQuintals || 0), 0).toFixed(1);
  const totalQuantityProcured = lots.reduce((sum, l) => sum + (l.quantityQuintals || 0), 0).toFixed(1);
  const totalProcurementValue = lots.reduce((sum, l) => sum + (l.financials?.grossValue || 0), 0);
  const pendingAssaysCount = lots.filter(l => l.status === 'QUALITY CHECK').length;
  const pendingPaymentsAmount = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((sum, p) => sum + p.finalAmount, 0);
  const completedLotsCount = lots.filter(l => l.status === 'COMPLETED').length;

  const currentDateStr = 'Thursday, 05 March 2026';

  return (
    <div className="space-y-6">
      {/* Top Banner: Header & Operational Status */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>APMC LIVE OPERATIONAL STATUS • {currentCenter.status}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Farmer Procurement Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <Building2 className="size-3.5 text-slate-400" />
            <span>{currentCenter.name}</span>
            <span>•</span>
            <Calendar className="size-3.5 text-slate-400" />
            <span>{currentDateStr}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/procurement/gate-entry"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="size-3.5" /> New Gate Entry
          </Link>
          <Link
            to="/procurement/schedules"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="size-3.5" /> Book Slot
          </Link>
          <Link
            to="/procurement/queue"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Users2 className="size-3.5" /> View Queue
          </Link>
        </div>
      </div>

      {/* 8 Flagship Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Registered Farmers"
          value={totalFarmersCount.toLocaleString()}
          subtext="52 active in jurisdiction"
          trend="12.4%"
          trendPositive={true}
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigate('/farmers')}
        />
        <MetricCard
          title="Today's Gate Entries"
          value={todayEntries.toLocaleString()}
          subtext="Vehicles logged at Mandi gates"
          trend="8.1%"
          trendPositive={true}
          icon={Truck}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
          onClick={() => navigate('/procurement/gate-entry')}
        />
        <MetricCard
          title="Active Queue"
          value={activeQueueCount.toString()}
          subtext={`Avg wait ~${currentCenter.avgWaitTimeMinutes} mins`}
          trend="4.2%"
          trendPositive={false}
          icon={Users2}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          onClick={() => navigate('/procurement/queue')}
        />
        <MetricCard
          title="Today's Procurement"
          value={`${todayProcurementQtl} Qtl`}
          subtext="Across Wheat, Onion, Soybean"
          trend="15.0%"
          trendPositive={true}
          icon={Package}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigate('/procurement/overview')}
        />
        <MetricCard
          title="Total Quantity Procured"
          value={`${parseFloat(totalQuantityProcured).toLocaleString()} Qtl`}
          subtext="Rabi 2026 season cumulative"
          trend="9.3%"
          trendPositive={true}
          icon={Scale}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigate('/procurement/lots')}
        />
        <MetricCard
          title="Procurement Value"
          value={`₹${(totalProcurementValue / 100000).toFixed(2)} Lakh`}
          subtext="100% verified MSP settlements"
          trend="11.8%"
          trendPositive={true}
          icon={IndianRupee}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigate('/payments/overview')}
        />
        <MetricCard
          title="Pending Quality Assays"
          value={pendingAssaysCount.toString()}
          subtext="2 laboratory counters active"
          trend="2 awaiting"
          trendPositive={true}
          icon={FlaskConical}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          onClick={() => navigate('/procurement/quality')}
        />
        <MetricCard
          title="Pending Payments"
          value={`₹${(pendingPaymentsAmount / 100000).toFixed(2)} Lakh`}
          subtext="Ready for batch PFMS disbursement"
          trend="Clearing daily"
          trendPositive={true}
          icon={CreditCard}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          onClick={() => navigate('/payments/pending')}
        />
      </div>

      {/* Operational Highlights Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-tiny font-bold uppercase tracking-wider text-slate-400">Average Waiting Time</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{currentCenter.avgWaitTimeMinutes} Minutes</p>
          <span className="text-tiny text-emerald-600 font-semibold">Target &lt;45 mins achieved</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-tiny font-bold uppercase tracking-wider text-slate-400">Average Processing Time</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{currentCenter.avgProcessingTimeMinutes} Mins / Lot</p>
          <span className="text-tiny text-slate-500">Weighment + Assay + Clearance</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-tiny font-bold uppercase tracking-wider text-slate-400">Active Counters</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{counters.filter(c => c.status === 'ACTIVE').length} / {counters.length} Online</p>
          <span className="text-tiny text-emerald-600 font-semibold">100% capacity deployed</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-tiny font-bold uppercase tracking-wider text-slate-400">Completed Lots</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{completedLotsCount} Lots</p>
          <span className="text-tiny text-slate-500">Fully cleared & bill generated</span>
        </div>
      </div>

      {/* Live Queue & Active Counters Snapshot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Counters Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Live Mandi Counters & Tokens
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-tiny px-2 py-0.5 font-bold">
                  Live Dispatch
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational status across weighbridge and quality assessment desks
              </p>
            </div>
            <Link
              to="/procurement/queue"
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Manage Desks <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {counters.map(counter => {
              const isActive = counter.status === 'ACTIVE';
              return (
                <div
                  key={counter.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isActive ? 'border-slate-200 bg-slate-50/60' : 'border-dashed border-slate-200 bg-slate-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{counter.name}</span>
                    <span className={`size-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-tiny text-slate-400 block font-medium">Serving Token</span>
                      <span className="text-lg font-black font-mono text-emerald-700">
                        {counter.currentToken || '— Idle —'}
                      </span>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => callNextToken(counter.id)}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-tiny font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        Call Next
                      </button>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-tiny text-slate-500">
                    <span>Operator: {counter.operator}</span>
                    <span>{counter.servedToday} served</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Waiting Time & Token Spotlight */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Queue Wait Intelligence</h3>
              </div>
              <span className="text-tiny font-medium text-slate-400">Heuristic Engine</span>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <span className="text-tiny uppercase font-bold text-amber-800 tracking-wider block">
                Estimated Waiting Time
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-950">~38 minutes</span>
                <span className="text-xs font-semibold text-amber-800">for Token A105</span>
              </div>
              <p className="mt-2 text-xs text-amber-900/80 leading-relaxed">
                Calculated dynamically from <strong>17 vehicles ahead</strong> across 4 active counters with an average throughput of <strong>14 mins / lot</strong>.
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Current Serving Token:</span>
                <span className="font-bold text-emerald-700 font-mono">A088 (Counter 1)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Demo Walkthrough Token:</span>
                <span className="font-bold text-slate-900 font-mono">A105 (Ramesh Patil)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Slot Adherence:</span>
                <span className="font-semibold text-emerald-600">96.4% on-time arrivals</span>
              </div>
            </div>
          </div>

          <Link
            to="/procurement/tokens"
            className="mt-5 w-full text-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Inspect Digital Token A105 →
          </Link>
        </div>
      </div>

      {/* Recent Procurement Lots Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Procurement Lots</h3>
            <p className="text-xs text-slate-500">Live lots currently processing across gate, assay, weighment and payment stages</p>
          </div>
          <Link
            to="/procurement/lots"
            className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
          >
            View all 105 lots <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Lot ID</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Farmer</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3 text-right">Final Amount</th>
                <th className="px-4 py-3">Procurement Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.slice(0, 8).map(lot => (
                <tr
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">
                    {lot.lotNumber || lot.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">
                    {lot.tokenNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div>{lot.farmerName}</div>
                    <span className="text-tiny text-slate-400">{lot.farmerId}</span>
                  </td>
                  <td className="px-4 py-3">{lot.commodity}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {lot.quantityQuintals} Qtl
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                      Grade {lot.assay?.grade || 'A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{lot.financials?.netPayableAmount?.toLocaleString('en-IN') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lot.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lot.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedLot(lot)}
                        title="View Lot Lifecycle"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => setPrintModalLot(lot)}
                        title="Print Mandi Tak-Patti"
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Printer className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedLot)}
        onClose={() => setSelectedLot(null)}
        title={selectedLot?.lotNumber ? `Procurement Lot: ${selectedLot.lotNumber}` : 'Lot Details'}
        subtitle={`Token: ${selectedLot?.tokenNumber} • Farmer: ${selectedLot?.farmerName}`}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Procurement Center: <strong>{selectedLot?.centerName}</strong>
            </span>
            <button
              onClick={() => {
                setPrintModalLot(selectedLot);
                setSelectedLot(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Printer className="size-3.5" /> Print Tak-Patti (Form J)
            </button>
          </div>
        }
      >
        {selectedLot && (
          <div className="space-y-6">
            {/* Quick summary strip */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-tiny">Commodity</span>
                  <span className="font-bold text-slate-800">{selectedLot.commodity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-tiny">Certified Net Qty</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedLot.quantityQuintals} Qtl</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-tiny">Net Payable</span>
                  <span className="font-bold font-mono text-slate-900">₹{selectedLot.financials?.netPayableAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-tiny">Payment Status</span>
                  <StatusBadge status={selectedLot.paymentStatus} />
                </div>
              </div>
            </div>

            {/* Complete 9-Stage Timeline */}
            <Timeline currentStatus={selectedLot.status} history={selectedLot.timeline || []} />

            {/* Quality Assay Particulars */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quality Assessment Particulars</h4>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>Moisture: <strong>{selectedLot.assay?.moisturePercent}%</strong></div>
                <div>Foreign Matter: <strong>{selectedLot.assay?.foreignMatterPercent}%</strong></div>
                <div>Certified Grade: <strong className="text-emerald-700 font-bold">Grade {selectedLot.assay?.grade}</strong></div>
              </div>
              <p className="text-tiny text-slate-500 italic mt-1">
                {selectedLot.assay?.remarks || 'Meets FAQ procurement specifications.'}
              </p>
            </div>

            {/* Weighbridge Particulars */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Weighbridge Scale Breakdown</h4>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 text-center bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-tiny text-slate-400 block">Gross Wt</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLot.grossWeightKg?.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-tiny text-slate-400 block">Tare Wt</span>
                  <span className="font-mono font-bold text-slate-500">{selectedLot.tareWeightKg?.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-tiny text-emerald-700 block font-bold">Net Wt</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedLot.netWeightKg?.toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Printable Modal */}
      {printModalLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <TakPattiPrint lot={printModalLot} onClose={() => setPrintModalLot(null)} />
            <div className="mt-4 text-center no-print">
              <button
                onClick={() => setPrintModalLot(null)}
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Print Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
