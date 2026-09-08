import { useState, useEffect } from 'react';
import { 
  Gavel, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Building2
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';

export default function AuctionDashboard() {
  const { auctions, currentCenter, placeBid, closeAuction, currentRole, setCurrentRole } = useProcurement();

  // Keep active role synced when visiting /dashboard/auction
  useEffect(() => {
    if (currentRole !== 'auction_officer') {
      setCurrentRole('auction_officer');
    }
  }, [currentRole, setCurrentRole]);

  // Selected auction for live bidding console
  const [selectedAuctionId, setSelectedAuctionId] = useState(auctions[0]?.id || 'AUC-2026-101');
  const activeAuction = auctions.find(a => a.id === selectedAuctionId) || auctions[0];

  // Custom bid form
  const [buyerName, setBuyerName] = useState('Mahagrains Commercial Trading Ltd.');

  const handlePlaceBid = (increment) => {
    if (!activeAuction) return;
    placeBid(activeAuction.id, increment, buyerName);
  };

  const handleAllotAndClose = () => {
    if (!activeAuction) return;
    closeAuction(activeAuction.id);
  };

  const activeCount = auctions.filter(a => a.status === 'IN_AUCTION').length;
  const soldCount = auctions.filter(a => a.status === 'SOLD').length;
  const upcomingCount = auctions.filter(a => a.status === 'UPCOMING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-xs font-bold">
              AUCTION YARD 1
            </span>
            <span className="text-xs text-slate-400">• Live Mandi Price Discovery & Bidding Floor</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Auction & Mandi Officer Console</h1>
          <p className="text-xs text-slate-500">
            {currentCenter.name} • Government Minimum Support Price (MSP) Floor Protected
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            Live Bidding Clock Active
          </span>
        </div>
      </div>

      {/* KPI Cards: Exactly matching Auction Officer Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Auctions"
          value={activeCount}
          sublabel="Lots open for bids on yard"
          icon={Gavel}
          color="purple"
        />
        <MetricCard
          title="Lots Ready for Auction"
          value={upcomingCount}
          sublabel="Assay cleared, ready to bid"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Completed Auctions"
          value={soldCount}
          sublabel="Allotted to winning commercial buyer"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Avg Premium Above MSP"
          value="+₹62 / Qtl"
          sublabel="Average premium realized by farmers"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Main Grid: Live Bidding Terminal + Active Auctions Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Bidding Terminal */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Bidding Terminal</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
              {activeAuction?.status || 'IN_AUCTION'}
            </span>
          </div>

          {/* Active Lot Details Card */}
          {activeAuction && (
            <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 text-sm">{activeAuction.lotNumber}</span>
                <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-purple-200 font-bold">
                  Token {activeAuction.tokenNumber}
                </span>
              </div>
              <p className="text-slate-700">
                Farmer: <strong className="text-slate-900">{activeAuction.farmerName}</strong> ({activeAuction.village})
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-purple-200/60">
                <span>Commodity: <strong>{activeAuction.commodity}</strong> ({activeAuction.grade})</span>
                <span className="font-mono font-bold text-slate-700">{activeAuction.quantityQuintals} Qtl</span>
              </div>
            </div>
          )}

          {/* Real-time Bid Display */}
          <div className="p-4 rounded-xl bg-slate-950 text-white font-mono text-center shadow-inner space-y-1">
            <span className="text-[10px] text-purple-400 uppercase tracking-widest block font-sans font-bold">
              CURRENT HIGHEST BID
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">
              ₹{activeAuction?.currentHighestBid?.toLocaleString('en-IN') || '2,475'}
              <span className="text-sm font-normal text-slate-400 font-sans"> / Qtl</span>
            </div>
            <div className="text-xs text-slate-300 font-sans flex items-center justify-center gap-2 pt-1">
              <span>MSP Floor: <strong className="text-slate-200">₹{activeAuction?.minimumPrice || 2425}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                +₹{(activeAuction?.currentHighestBid - activeAuction?.minimumPrice) || 50} Premium
              </span>
            </div>
          </div>

          {/* Highest Bidder Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Leading Commercial Buyer</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {activeAuction?.highestBidderName || 'Awaiting Bid'}
            </div>
            <span className="text-[11px] text-slate-500">
              Total Bids Placed: <strong className="text-purple-700 font-mono">{activeAuction?.bidsCount || 0}</strong>
            </span>
          </div>

          {/* Quick Increment Actions */}
          {activeAuction?.status === 'IN_AUCTION' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Active Buyer Entity (Demo Simulation)
                </label>
                <select
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="Mahagrains Commercial Trading Ltd.">Mahagrains Commercial Trading Ltd.</option>
                  <option value="Ruchi Agro Extraction Corp">Ruchi Agro Extraction Corp</option>
                  <option value="Adani Wilmar Agri Hub">Adani Wilmar Agri Hub</option>
                  <option value="Kisan Food Processing Co.">Kisan Food Processing Co.</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Simulate Live Bid Increment
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlaceBid(25)}
                    className="py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs transition-colors cursor-pointer"
                  >
                    + ₹25 / Qtl
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaceBid(50)}
                    className="py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs transition-colors cursor-pointer"
                  >
                    + ₹50 / Qtl
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaceBid(100)}
                    className="py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs transition-colors cursor-pointer"
                  >
                    + ₹100 / Qtl
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAllotAndClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Close Auction & Authorize Allotment</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800 font-bold">
              Auction Closed & Allotted Successfully
            </div>
          )}
        </div>

        {/* Mandi Auction Floor Ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Mandi Bidding Floor Schedule</h3>
                <p className="text-[11px] text-slate-400">Click any lot to load into the active bidding terminal.</p>
              </div>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold">
                Auction Floor Open • Rabi 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="pb-2.5">Lot ID</th>
                    <th className="pb-2.5">Farmer & Village</th>
                    <th className="pb-2.5">Commodity</th>
                    <th className="pb-2.5">Quantity</th>
                    <th className="pb-2.5">MSP Base</th>
                    <th className="pb-2.5">Highest Bid</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auctions.map((auc) => {
                    const isSelected = selectedAuctionId === auc.id;

                    return (
                      <tr
                        key={auc.id}
                        onClick={() => setSelectedAuctionId(auc.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-2.5">
                          <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {auc.lotNumber}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="text-slate-900 block">{auc.farmerName}</span>
                          <span className="text-[10px] text-slate-400">{auc.village}</span>
                        </td>
                        <td className="py-2.5 text-slate-700">
                          {auc.commodity}
                        </td>
                        <td className="py-2.5 font-mono text-slate-700">
                          {auc.quantityQuintals} Qtl
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          ₹{auc.minimumPrice}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-amber-700">
                          ₹{auc.currentHighestBid}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            auc.status === 'IN_AUCTION'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                              : auc.status === 'SOLD'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {auc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing active and cleared lots in current bidding round</span>
            <span className="font-semibold text-purple-700">Auction Officer Signoff Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
