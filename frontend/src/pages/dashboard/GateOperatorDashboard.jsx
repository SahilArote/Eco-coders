import { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Plus, 
  Search,
  Clock,
  Ticket,
  Printer
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import GatePassPrint from '../../components/documents/GatePassPrint';

export default function GateOperatorDashboard() {
  const { tokens, vehicles, checkInGate, bookSlot, currentCenter, showToast, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/gate
  useEffect(() => {
    if (currentRole !== 'gate_operator') {
      setCurrentRole('gate_operator');
    }
  }, [currentRole, setCurrentRole]);

  // Inward Fast Entry Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerMobile, setFarmerMobile] = useState('');
  const [commodity, setCommodity] = useState('Wheat');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  const [expectedQty, setExpectedQty] = useState('35');

  // Print Gate Pass modal state
  const [printPassToken, setPrintPassToken] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fast Inward Check-in submission
  const handleFastEntry = (e) => {
    e.preventDefault();
    if (!vehicleNo || !farmerName) {
      showToast('Please enter vehicle number and farmer name', 'error');
      return;
    }

    const issuedToken = bookSlot({
      farmerName,
      farmerMobile: farmerMobile || '9822101341',
      commodity,
      expectedQuantityQtl: expectedQty,
      vehicleNumber: vehicleNo,
      centerId: currentCenter.id
    });

    checkInGate(issuedToken.tokenNumber, vehicleNo);

    // Reset form
    setVehicleNo('');
    setFarmerName('');
    setFarmerMobile('');
    setExpectedQty('35');

    // Offer to print gate pass
    setPrintPassToken(issuedToken);
  };

  const filteredTokens = tokens.filter(t => 
    t.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.vehicleNumber && t.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const arrivedCount = tokens.filter(t => t.status === 'ARRIVED').length;
  const waitingCount = tokens.filter(t => t.status === 'WAITING' || t.status === 'BOOKED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              GATE #2 DESK
            </span>
            <span className="text-xs text-slate-400">• Security Inward & Token Station</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Gate / Entry Operator Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Live Inward Verification, Vehicle Staging & Gate Passes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gate 2 Barrier: OPEN
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Gate Operator Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Gate Entries"
          value={`${vehicles.length + 24}`}
          sublabel="Total gate check-ins logged"
          icon={Truck}
          color="emerald"
        />
        <MetricCard
          title="Vehicles Arrived"
          value={arrivedCount}
          sublabel="Inward clearance approved"
          icon={CheckCircle2}
          color="sky"
        />
        <MetricCard
          title="Waiting Vehicles"
          value={waitingCount}
          sublabel="Awaiting entry verification"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Active Tokens"
          value={tokens.filter(t => ['ARRIVED', 'WAITING', 'PROCESSING'].includes(t.status)).length}
          sublabel="Active yard queue sequence"
          icon={Ticket}
          color="purple"
        />
      </div>

      {/* Main Grid: Fast Check-in Form + Arrival Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fast Inward Check-in Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Plus className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">New Vehicle Gate Entry</h3>
          </div>

          <form onSubmit={handleFastEntry} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vehicle Registration Number *
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                placeholder="e.g. MH-12-AQ-4481"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Farmer / Driver Name *
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Driver Mobile</label>
                <input
                  type="tel"
                  value={farmerMobile}
                  onChange={(e) => setFarmerMobile(e.target.value)}
                  placeholder="9822101341"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tractor Trolley">Tractor Trolley</option>
                  <option value="Pickup (Bolero)">Pickup (Bolero)</option>
                  <option value="6-Wheeler Truck">6-Wheeler Truck</option>
                  <option value="Small Commercial">Small Commercial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commodity</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Gram / Chana">Gram (चना)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Paddy / Rice">Paddy (धान)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Est. Qtl</label>
                <input
                  type="number"
                  value={expectedQty}
                  onChange={(e) => setExpectedQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Token & Authorize Gate Inward</span>
            </button>
          </form>
        </div>

        {/* Live Inward Arrivals & Tokens Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Live Gate Inward Ledger</h3>
                <p className="text-[11px] text-slate-400">Tokens staged for electronic weighbridge intake.</p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search token, vehicle, farmer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="pb-2.5">Token</th>
                    <th className="pb-2.5">Vehicle</th>
                    <th className="pb-2.5">Farmer Name</th>
                    <th className="pb-2.5">Commodity</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTokens.slice(0, 7).map((item) => (
                    <tr key={item.tokenNumber} className="hover:bg-slate-50/70">
                      <td className="py-2.5">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.tokenNumber}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-semibold text-slate-800">
                        {item.vehicleNumber || 'MH-12-AQ-4481'}
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-slate-900 block">{item.farmerName}</span>
                        <span className="text-[10px] text-slate-400">{item.farmerId}</span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-slate-700 font-medium">{item.commodity}</span>
                        <span className="text-[10px] text-slate-400 block">{item.expectedQuantityQtl} Qtl</span>
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setPrintPassToken(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          Gate Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing {Math.min(filteredTokens.length, 7)} of {tokens.length} gate tokens</span>
            <span className="font-semibold text-emerald-700">Security Gate #2 Operational</span>
          </div>
        </div>
      </div>

      {/* Printable Gate Pass Modal */}
      {printPassToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <GatePassPrint lot={printPassToken} token={printPassToken} />
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPrintPassToken(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Pass Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
