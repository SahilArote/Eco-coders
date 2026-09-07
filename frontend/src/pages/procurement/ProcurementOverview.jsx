import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Package, TrendingUp, DollarSign, CheckCircle2, AlertTriangle, Layers, Filter } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';

const COLORS = ['#059669', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

export default function ProcurementOverview() {
  const { lots, crops, centers } = useProcurement();

  // Aggregate commodity quantities
  const commodityData = crops.map(crop => {
    const cropLots = lots.filter(l => l.commodity.toLowerCase().includes(crop.name.toLowerCase().split(' ')[0]));
    const totalQtl = cropLots.reduce((sum, l) => sum + (l.quantityQuintals || 0), 0);
    const totalVal = cropLots.reduce((sum, l) => sum + (l.financials?.grossValue || 0), 0);
    return {
      name: crop.name,
      quantity: Math.round(totalQtl),
      valueLakh: +(totalVal / 100000).toFixed(2),
      lotsCount: cropLots.length,
      msp: crop.msp
    };
  }).filter(c => c.quantity > 0);

  // Status distribution
  const statusCounts = [
    { name: 'Completed', value: lots.filter(l => l.status === 'COMPLETED').length, color: '#059669' },
    { name: 'Accepted', value: lots.filter(l => l.status === 'ACCEPTED').length, color: '#10b981' },
    { name: 'Weighment', value: lots.filter(l => l.status === 'WEIGHMENT').length, color: '#3b82f6' },
    { name: 'Quality Assay', value: lots.filter(l => l.status === 'QUALITY CHECK').length, color: '#f59e0b' },
    { name: 'In Queue', value: lots.filter(l => ['WAITING', 'ARRIVED', 'PROCESSING'].includes(l.status)).length, color: '#6366f1' },
    { name: 'Rejected', value: lots.filter(l => l.status === 'REJECTED').length, color: '#f43f5e' }
  ];

  // Daily Trend Mock
  const dailyTrend = [
    { day: 'Mon', procurementQtl: 320, valueLakh: 7.8 },
    { day: 'Tue', procurementQtl: 450, valueLakh: 10.9 },
    { day: 'Wed', procurementQtl: 580, valueLakh: 14.1 },
    { day: 'Thu (Today)', procurementQtl: 640, valueLakh: 15.8 },
    { day: 'Fri (Est)', procurementQtl: 610, valueLakh: 14.9 },
    { day: 'Sat (Est)', procurementQtl: 420, valueLakh: 10.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Procurement Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          State-level aggregate summary of commodity procurement, quality grading, and physical lot clearance
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Lots Registered"
          value={lots.length.toString()}
          subtext="Active in Rabi 2026 Season"
          icon={Layers}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Procured Volume"
          value={`${Math.round(lots.reduce((acc, l) => acc + (l.quantityQuintals || 0), 0)).toLocaleString()} Qtl`}
          subtext="Certified at electronic weighbridges"
          icon={Package}
          iconBg="bg-sky-50 text-sky-600 border-sky-100"
        />
        <MetricCard
          title="Procurement Value"
          value={`₹${(lots.reduce((acc, l) => acc + (l.financials?.grossValue || 0), 0) / 100000).toFixed(2)} Lakh`}
          subtext="Total MSP commitment value"
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <MetricCard
          title="Lot Acceptance Rate"
          value="96.2%"
          subtext="Quality standard compliance"
          trend="0.8% rejection"
          trendPositive={true}
          icon={CheckCircle2}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Procurement Trend (Quintals)</h3>
              <p className="text-tiny text-slate-500">Volume procured across all 5 APMC hubs over the last 6 days</p>
            </div>
            <span className="text-tiny rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              Rabi Season
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} Quintals`, 'Volume']}
                />
                <Bar dataKey="procurementQtl" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lot Status Distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Lot Status Distribution</h3>
            <p className="text-tiny text-slate-500">Breakdown of 105 active lots across stages</p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {statusCounts.map(st => (
              <div key={st.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-slate-600 text-tiny">{st.name}:</span>
                <strong className="text-slate-800 text-tiny font-mono">{st.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commodity-wise Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Commodity-Wise Procurement Breakdown</h3>
          <p className="text-xs text-slate-500">Notified MSP, procured volume, and value across Indian agricultural crops</p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3 text-right">Notified MSP (₹/Qtl)</th>
                <th className="px-4 py-3 text-right">Procured Quantity</th>
                <th className="px-4 py-3 text-right">Procurement Value</th>
                <th className="px-4 py-3 text-center">Active Lots</th>
                <th className="px-4 py-3">Procurement Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {commodityData.map((item, idx) => (
                <tr key={item.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    ₹{item.msp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {item.quantity.toLocaleString()} Qtl
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{item.valueLakh} Lakh
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold">
                      {item.lotsCount} Lots
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active Rabi Window
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
