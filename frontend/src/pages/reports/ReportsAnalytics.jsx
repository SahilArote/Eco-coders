import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Download,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import { useProcurement } from '../../context/ProcurementContext';

export default function ReportsAnalytics() {
  const { centers, lots } = useProcurement();

  // Center Comparison Metrics (Section 27)
  const centerComparison = centers.map((c, i) => {
    const centerLots = lots.filter(l => l.centerId === c.id);
    const volumeQtl = centerLots.reduce((acc, l) => acc + (l.quantityQuintals || 0), 0);
    const valueAmt = centerLots.reduce((acc, l) => acc + (l.financials?.grossValue || 0), 0);
    const completed = centerLots.filter(l => l.status === 'COMPLETED').length;
    const rejected = centerLots.filter(l => l.status === 'REJECTED').length;

    return {
      id: c.id,
      name: c.name,
      district: c.district,
      farmersServed: 120 + i * 45,
      volumeQtl: Math.round(volumeQtl) || (450 + i * 180),
      valueLakh: +((valueAmt || (450 + i * 180) * 2425) / 100000).toFixed(2),
      avgWaitMins: c.avgWaitTimeMinutes,
      avgProcMins: c.avgProcessingTimeMinutes,
      counters: c.activeCounters,
      utilization: Math.round((c.bookedSlots / c.totalCapacity) * 100),
      completedLots: completed || 18 + i * 6,
      rejectedLots: rejected || (i === 4 ? 3 : 1),
      paymentRate: '98.4%'
    };
  });

  // Monthly Trend Mock Data
  const monthlyTrend = [
    { month: 'Oct 25', volume: 1200, valueLakh: 29.1 },
    { month: 'Nov 25', volume: 1850, valueLakh: 44.8 },
    { month: 'Dec 25', volume: 2400, valueLakh: 58.2 },
    { month: 'Jan 26', volume: 3100, valueLakh: 75.1 },
    { month: 'Feb 26', volume: 3950, valueLakh: 95.7 },
    { month: 'Mar 26 (Current)', volume: 4620, valueLakh: 112.0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Procurement Reports &amp; Mandi Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official government analytical intelligence across centers, throughput queues, and MSP expenditure
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <Download className="size-3.5" /> Export Analytics PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Mandi Volume"
          value="4,620 Qtl"
          subtext="Season cumulative procured"
          trend="16.4%"
          trendPositive={true}
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Total Financial Outlay"
          value="₹1.12 Crore"
          subtext="100% direct bank credit"
          trend="12.0%"
          trendPositive={true}
          icon={Building2}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Average Mandi Wait"
          value="31.2 Mins"
          subtext="Network-wide average"
          trend="8 mins faster"
          trendPositive={true}
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
        <MetricCard
          title="Govt DBT Settlement Rate"
          value="98.6%"
          subtext="Direct to farmer bank accounts"
          trend="0.2% pending"
          trendPositive={true}
          icon={CheckCircle2}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
        />
      </div>

      {/* Main Growth Area Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Procurement Volume Trajectory (Quintals)</h3>
            <p className="text-tiny text-slate-500">Kharif-Rabi progressive agricultural procurement curve</p>
          </div>
          <span className="text-tiny rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">
            Target 5,000 Qtl
          </span>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val} Quintals`, 'Total Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#volumeColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Center Performance Comparison Table (Section 27) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Center Performance Benchmarking</h3>
          <p className="text-xs text-slate-500">Comparative metrics across all 5 APMC procurement hubs</p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Procurement Hub</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3 text-right">Farmers Served</th>
                <th className="px-4 py-3 text-right">Volume (Qtl)</th>
                <th className="px-4 py-3 text-right">Outlay Value</th>
                <th className="px-4 py-3 text-center">Avg Wait</th>
                <th className="px-4 py-3 text-center">Counters</th>
                <th className="px-4 py-3 text-center">Slot Utilization</th>
                <th className="px-4 py-3 text-right">Settlement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {centerComparison.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.district}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{c.farmersServed}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">{c.volumeQtl.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹{c.valueLakh} L</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-amber-700">~{c.avgWaitMins}m</td>
                  <td className="px-4 py-3 text-center font-mono">{c.counters} Desks</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-slate-800">{c.utilization}%</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">{c.paymentRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
