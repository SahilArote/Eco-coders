import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Truck, 
  Scale, 
  FlaskConical, 
  Gavel, 
  PackageCheck, 
  CreditCard, 
  TrendingUp, 
  Building2, 
  Calendar,
  Layers,
  Activity,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';

export default function AdminDashboard() {
  const { 
    currentCenter, 
    farmers, 
    tokens, 
    lots, 
    auctions, 
    payments, 
    currentRole,
    setCurrentRole
  } = useProcurement();

  // Keep active role synced when visiting /dashboard/admin
  useEffect(() => {
    if (currentRole !== 'admin') {
      setCurrentRole('admin');
    }
  }, [currentRole, setCurrentRole]);

  // Metric Computations
  const totalFarmers = farmers.length;
  const todayGateEntries = tokens.filter(t => t.status !== 'BOOKED').length;
  const activeWeighments = lots.filter(l => l.grossWeightKg > 0 && (!l.tareWeightKg || l.tareWeightKg === 0)).length;
  const pendingQualityChecks = lots.filter(l => !l.assay || l.assay.status === 'QUALITY CHECK').length;
  const activeAuctionLots = auctions.filter(a => a.status === 'IN_AUCTION').length;
  const todayProcurementQtl = lots
    .filter(l => l.gateEntryTime?.includes('2026-03-05') || l.status === 'COMPLETED')
    .reduce((sum, l) => sum + (l.quantityQuintals || 0), 0)
    .toFixed(1);
  const pendingSettlements = lots.filter(l => l.status === 'ACCEPTED').length;
  const pendingPaymentsAmount = payments
    .filter(p => p.status === 'PENDING' || p.status === 'INITIATED')
    .reduce((sum, p) => sum + (p.finalAmount || p.netPayableAmount || 0), 0);
  const totalProcurementValue = lots.reduce((sum, l) => sum + (l.financials?.grossValue || 0), 0);

  // Operational cross-department activity feed
  const operationalEvents = [
    { time: '11:42 AM', dept: 'DBT Accounts', event: 'PFMS batch transfer initiated for 6 farmer lots (₹4.82 Lakhs)', icon: CreditCard, color: 'text-teal-600 bg-teal-50' },
    { time: '11:38 AM', dept: 'Auction Yard', event: 'Lot AUC-2026-101 (Wheat) bid closed at ₹2,550/Qtl by Patanjali Agro', icon: Gavel, color: 'text-purple-600 bg-purple-50' },
    { time: '11:29 AM', dept: 'Procurement Cell', event: 'Tak-Patti Form J issued for Lot LOT-2026-001 (Ramesh Patil)', icon: PackageCheck, color: 'text-indigo-600 bg-indigo-50' },
    { time: '11:15 AM', dept: 'Quality Lab', event: 'Assay certified Grade A (Moisture 11.2%) for Token A105', icon: FlaskConical, color: 'text-sky-600 bg-sky-50' },
    { time: '10:55 AM', dept: 'Weighbridge', event: 'Tare weight 1,620 kg captured; Net 32.30 Qtl calculated', icon: Scale, color: 'text-amber-600 bg-amber-50' },
    { time: '10:30 AM', dept: 'Gate Security', event: 'Vehicle MH-12-AQ-4481 checked in at Gate 2; Lane assigned', icon: Truck, color: 'text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Administrative Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-xs font-bold">
              SUPERVISOR COMMAND
            </span>
            <span className="text-xs text-slate-400">• Central APMC Yard Administration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Mandi Supervisor & Administrator Console</h1>
          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <Building2 className="size-3.5 text-slate-400" />
            <span>{currentCenter.name}</span>
            <span>•</span>
            <Calendar className="size-3.5 text-slate-400" />
            <span>KMS Rabi 2025-26 Live Procurement Window</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All 6 Yard Desks Online
          </span>
        </div>
      </div>

      {/* KPI Cards: The exact system metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <MetricCard
          title="Total Registered Farmers"
          value={totalFarmers}
          subtext="52 active in jurisdiction"
          trend="+12.4%"
          trendPositive={true}
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Today's Gate Entries"
          value={todayGateEntries}
          subtext="Vehicles logged at Mandi gates"
          trend="+8.1%"
          trendPositive={true}
          icon={Truck}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
        />
        <MetricCard
          title="Active Weighments"
          value={activeWeighments}
          subtext="Gross recorded, tare pending"
          trend="In queue"
          trendPositive={true}
          icon={Scale}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
        <MetricCard
          title="Pending Quality Checks"
          value={pendingQualityChecks}
          subtext="Laboratory samples in testing"
          trend="2 active desks"
          trendPositive={true}
          icon={FlaskConical}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
        />
        <MetricCard
          title="Active Auction Lots"
          value={activeAuctionLots}
          subtext="Open on live bidding floor"
          trend="Live bidding"
          trendPositive={true}
          icon={Gavel}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
        />
        <MetricCard
          title="Today's Procurement"
          value={`${todayProcurementQtl} Qtl`}
          subtext="Across Wheat, Gram, Soybean"
          trend="+15.0%"
          trendPositive={true}
          icon={PackageCheck}
          iconBg="bg-indigo-50 text-indigo-600 border-indigo-100"
        />
        <MetricCard
          title="Pending Settlements"
          value={pendingSettlements}
          subtext="Lots awaiting Form J Tak-Patti"
          trend="Ready to sign"
          trendPositive={true}
          icon={Layers}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
        <MetricCard
          title="Pending Payments"
          value={`₹${(pendingPaymentsAmount / 100000).toFixed(2)} L`}
          subtext="Queued for PFMS DBT credit"
          trend="Daily clearing"
          trendPositive={true}
          icon={CreditCard}
          iconBg="bg-teal-50 text-teal-600 border-teal-100"
        />
        <MetricCard
          title="Overall Procurement Value"
          value={`₹${(totalProcurementValue / 100000).toFixed(2)} L`}
          subtext="Cumulative season intake value"
          trend="MSP certified"
          trendPositive={true}
          icon={TrendingUp}
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
        />
      </div>

      {/* Grid: Operational Activity Feed & Departmental Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="size-4 text-emerald-600" />
                Live Yard Operational Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail across Gate, Scale, Lab, Auction, Procurement, and DBT Accounts
              </p>
            </div>
            <span className="rounded-full bg-slate-100 text-slate-700 text-tiny px-2 py-0.5 font-bold">
              Live Stream
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {operationalEvents.map((ev, idx) => {
              const Icon = ev.icon;
              return (
                <div key={idx} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                  <div className={`p-2 rounded-xl shrink-0 ${ev.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{ev.dept}</span>
                      <span className="text-[11px] font-mono text-slate-400">{ev.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{ev.event}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Overview & Quick Station Jump */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="size-4 text-rose-600" />
              Operational Desk Navigation
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Direct access to dedicated ground station consoles for inspection:
            </p>

            <div className="space-y-2">
              <Link
                to="/dashboard/gate"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <Truck className="size-4 text-emerald-600" />
                  Gate Inward Kiosk
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard/weighbridge"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <Scale className="size-4 text-amber-600" />
                  Weighbridge Cabin
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard/quality"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-sky-600" />
                  Quality Assay Lab
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard/auction"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <Gavel className="size-4 text-purple-600" />
                  Live Auction Floor
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard/procurement"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="size-4 text-indigo-600" />
                  Procurement Approvals
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard/accounts"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="size-4 text-teal-600" />
                  Treasury & DBT Accounts
                </span>
                <ArrowRight className="size-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/farmers"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <Users className="size-3.5" /> View Farmer Master Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

