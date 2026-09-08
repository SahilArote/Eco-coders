import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Plus,
  Clock
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';

export default function AuctionFloor({ defaultTab = 'live' }) {
  const { auctions, currentCenter, placeBid, closeAuction } = useProcurement();

  const activeTab = defaultTab;

  const [searchQuery, setSearchQuery] = useState('');
  const initialStatusFilter = defaultTab === 'completed' ? 'SOLD' : defaultTab === 'live' ? 'IN_AUCTION' : 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidIncrement, setBidIncrement] = useState(50);
  const [buyerName, setBuyerName] = useState('Mahagrains Commercial Trading Ltd.');

  const handleBidSubmit = (auc) => {
    placeBid(auc.id, Number(bidIncrement), buyerName);
    setSelectedAuction(prev => prev ? ({
      ...prev,
      currentHighestBid: prev.currentHighestBid + Number(bidIncrement),
      highestBidderName: buyerName,
      bidsCount: prev.bidsCount + 1
    }) : null);
  };

  const handleClose = (auc) => {
    closeAuction(auc.id);
    setSelectedAuction(prev => prev ? ({ ...prev, status: 'SOLD' }) : null);
  };

  const effectiveFilter = activeTab === 'completed' ? 'SOLD' : activeTab === 'live' ? 'IN_AUCTION' : statusFilter;

  const filteredAuctions = auctions.filter(a => {
    const matchesSearch = a.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.highestBidderName && a.highestBidderName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = effectiveFilter === 'ALL' || a.status === effectiveFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = auctions.filter(a => a.status === 'IN_AUCTION').length;
  const soldCount = auctions.filter(a => a.status === 'SOLD').length;
  const totalVolumeInAuction = auctions.reduce((sum, a) => sum + (a.quantityQuintals || 0), 0).toFixed(1);

  // Flatten bid histories for the history view
  const allBids = auctions.flatMap(a => 
    (a.bidsHistory || []).map(b => ({
      ...b,
      lotNumber: a.lotNumber,
      commodity: a.commodity,
      farmerName: a.farmerName,
      auctionId: a.id
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mandi Auction Floor &amp; Price Discovery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentCenter.name} • Government MSP Floor Protected Bidding Platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <Gavel className="w-3.5 h-3.5" />
            Auction Round: Rabi 2026-03
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <div className="flex gap-2">
          <Link
            to="/procurement/auctions"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'live'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gavel className="size-3.5" />
            <span>Live Auctions ({activeCount})</span>
          </Link>
          <Link
            to="/procurement/auctions/history"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="size-3.5" />
            <span>Bid History</span>
          </Link>
          <Link
            to="/procurement/auctions/completed"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'completed'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Completed Auctions ({soldCount})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Lots in Auction"
          value={activeCount}
          sublabel="Currently open for commercial bids"
          icon={Gavel}
          color="purple"
        />
        <MetricCard
          title="Total Volume on Block"
          value={`${totalVolumeInAuction} Qtl`}
          sublabel="Quality certified produce"
          icon={TrendingUp}
          color="sky"
        />
        <MetricCard
          title="Allotted & Sold"
          value={soldCount}
          sublabel="Passed reserve MSP baseline"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Avg Realized Premium"
          value="+ ₹62 / Qtl"
          sublabel="Above government MSP baseline"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Bid History Table View */}
      {activeTab === 'history' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Commercial Bid Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Chronological history of competitive trader offers placed across active auction rounds.</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-100 text-purple-800">
              {allBids.length} Total Bids Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="pb-2.5">Lot Number</th>
                  <th className="pb-2.5">Farmer</th>
                  <th className="pb-2.5">Commodity</th>
                  <th className="pb-2.5">Commercial Trader</th>
                  <th className="pb-2.5 text-right">Offer Amount</th>
                  <th className="pb-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBids.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No bids recorded in this round yet.
                    </td>
                  </tr>
                ) : (
                  allBids.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{b.lotNumber}</td>
                      <td className="py-3">{b.farmerName}</td>
                      <td className="py-3 font-medium">{b.commodity}</td>
                      <td className="py-3 font-semibold text-purple-900">{b.bidderName}</td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        ₹{b.bidAmount?.toLocaleString('en-IN')} / Qtl
                      </td>
                      <td className="py-3 text-right text-slate-400">{b.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      /* Main Auction Table & Filters */
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {activeTab === 'completed' ? 'Completed & Allotted Auctions' : 'Live Mandi Bidding Schedule'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'completed' ? 'Historical record of closed auctions and winning buyer allotments.' : 'Click any auction lot to inspect bids and place simulated trader offers.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'completed' && activeTab !== 'live' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_AUCTION">In Auction</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="SOLD">Sold</option>
            </select>
            )}

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lot, farmer, commodity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-2.5">Auction ID</th>
                <th className="pb-2.5">Lot Number</th>
                <th className="pb-2.5">Farmer Name</th>
                <th className="pb-2.5">Commodity</th>
                <th className="pb-2.5 text-right">Quantity</th>
                <th className="pb-2.5 text-right">Reserve (MSP)</th>
                <th className="pb-2.5 text-right">Current High Bid</th>
                <th className="pb-2.5">Highest Bidder</th>
                <th className="pb-2.5 text-center">Bids Count</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAuctions.map((auc) => {
                return (
                  <tr key={auc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{auc.id}</td>
                    <td className="py-2.5 font-mono text-purple-700 font-semibold">{auc.lotNumber}</td>
                    <td className="py-2.5 font-medium text-slate-800">{auc.farmerName}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{auc.commodity}</td>
                    <td className="py-2.5 text-right font-mono font-medium">{auc.quantityQuintals} Qtl</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">₹{auc.minimumPrice?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                      ₹{auc.currentHighestBid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 font-medium text-slate-700">
                      {auc.highestBidderName || <span className="text-slate-400 italic">No Bids Yet</span>}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {auc.bidsCount} offers
                      </span>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={auc.status} />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setSelectedAuction(auc)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Gavel className="w-3 h-3" />
                        Bid Console
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Showing {filteredAuctions.length} total auctions</span>
          <span className="font-semibold text-purple-700">Mandi Commercial Trading Floor Verified</span>
        </div>
      </div>
      )}

      {/* Slide-Over Bidding & Allotment Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        title={`Auction Bidding Console: ${selectedAuction?.lotNumber || ''}`}
      >
        {selectedAuction && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
              <span className="text-purple-900 font-bold block text-sm">{selectedAuction.lotNumber}</span>
              <p className="text-slate-700">Farmer: <strong className="text-slate-900">{selectedAuction.farmerName}</strong> ({selectedAuction.farmerId})</p>
              <p className="text-slate-600">Location: {selectedAuction.village}, {selectedAuction.district}</p>
              <p className="text-slate-600">Commodity: {selectedAuction.commodity} ({selectedAuction.variety}) • {selectedAuction.quantityQuintals} Qtl</p>
            </div>

            {/* Current Price Box */}
            <div className="p-4 rounded-xl bg-slate-950 text-white font-mono text-center space-y-1">
              <span className="text-[10px] text-purple-400 uppercase tracking-widest block font-sans font-bold">
                CURRENT HIGHEST BID
              </span>
              <div className="text-3xl font-black text-amber-400">
                ₹{selectedAuction.currentHighestBid?.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400 font-sans">/ Qtl</span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                Reserve MSP Floor: ₹{selectedAuction.minimumPrice} / Qtl
              </p>
            </div>

            {/* Leading Buyer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Leading Bidder Entity</span>
              <strong className="text-slate-900 text-sm block">{selectedAuction.highestBidderName || 'None'}</strong>
              <span className="text-slate-500 text-[11px]">Total Bids Recorded: <span className="font-mono text-purple-700 font-bold">{selectedAuction.bidsCount}</span></span>
            </div>

            {selectedAuction.status === 'IN_AUCTION' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Bidding Entity</label>
                  <select
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
                  >
                    <option value="Mahagrains Commercial Trading Ltd.">Mahagrains Commercial Trading Ltd.</option>
                    <option value="Ruchi Agro Extraction Corp">Ruchi Agro Extraction Corp</option>
                    <option value="Adani Wilmar Agri Hub">Adani Wilmar Agri Hub</option>
                    <option value="Kisan Food Processing Co.">Kisan Food Processing Co.</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bid Increment (₹/Qtl)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBidIncrement(amt)}
                        className={`py-2 rounded-lg font-bold border text-xs cursor-pointer ${
                          bidIncrement === amt
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        + ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleBidSubmit(selectedAuction)}
                    className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Place Bid (+₹{bidIncrement})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClose(selectedAuction)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Close & Allot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
