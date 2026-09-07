import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Users2,
  Calendar,
  Phone,
  Navigation,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function CenterDiscovery() {
  const navigate = useNavigate();
  const { centers, selectedCenterId, setSelectedCenterId, crops, showToast } = useProcurement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredCenters = centers.filter(center => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match = center.name.toLowerCase().includes(term) ||
                    center.location.toLowerCase().includes(term) ||
                    center.district.toLowerCase().includes(term);
      if (!match) return false;
    }

    // 2. Crop filter
    if (selectedCrop !== 'ALL') {
      if (!center.supportedCrops.some(c => c.toLowerCase().includes(selectedCrop.toLowerCase()))) {
        return false;
      }
    }

    // 3. Status filter
    if (selectedStatus !== 'ALL') {
      if (center.status !== selectedStatus) return false;
    }

    return true;
  });

  const handleSelectActive = (centerId) => {
    setSelectedCenterId(centerId);
    showToast('Active Mandi switched to ' + centers.find(c => c.id === centerId)?.name, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Procurement Center Discovery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Locate authorized APMC grain terminals, check live wait times, slot availability, and commodity acceptance status
          </p>
        </div>
        <Link
          to="/procurement/schedules"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
        >
          <Calendar className="size-3.5" /> Book Procurement Slot
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Mandi name, village, or district..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Commodities</option>
            {crops.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Operating Statuses</option>
            <option value="OPEN">Open & Accepting</option>
            <option value="BUSY">Busy (High Queue)</option>
            <option value="DELAYED">Delayed / Maintenance</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Visual Placeholder */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
              <Compass className="size-4" />
              <span>APMC JURISDICTION COVERAGE MAP</span>
            </div>
            <h3 className="text-lg font-bold">Maharashtra Western & Marathwada Zone Network</h3>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              5 Government procurement hubs connected in real time. Nearest hub to your registered farm location: <strong>APMC Pune Main Yard (8.5 km)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-tiny text-slate-400 block">Total Active Slots</span>
              <span className="text-xl font-bold font-mono text-emerald-400">1,470 Today</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-right">
              <span className="text-tiny text-slate-400 block">Active Weighbridges</span>
              <span className="text-xl font-bold font-mono text-amber-400">20 Scales</span>
            </div>
          </div>
        </div>

        {/* Map Dots Strip Representation */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {centers.map(center => (
            <div
              key={center.id}
              onClick={() => handleSelectActive(center.id)}
              className={`rounded-xl p-2.5 cursor-pointer border transition-all ${
                center.id === selectedCenterId
                  ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-tiny text-slate-400">{center.distance}</span>
                <span className={`size-2 rounded-full ${center.status === 'OPEN' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <p className="text-xs font-semibold truncate mt-1">{center.name.split(' ')[1] || center.name}</p>
              <span className="text-tiny text-emerald-300 font-mono">Wait ~{center.avgWaitTimeMinutes}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Centers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCenters.map(center => {
          const isSelected = center.id === selectedCenterId;
          const capacityPercent = Math.round((center.bookedSlots / center.totalCapacity) * 100);

          return (
            <div
              key={center.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-tiny font-bold font-mono text-slate-400 uppercase">
                      {center.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {center.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="size-3 text-slate-400" />
                      <span>{center.location}, {center.district}</span>
                      <span>•</span>
                      <strong className="text-slate-700">{center.distance}</strong>
                    </p>
                  </div>
                  <StatusBadge status={center.status} size="xs" />
                </div>

                {/* Operating Hours & Contact */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-slate-400" />
                    <span>{center.todaySchedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Phone className="size-3.5 text-slate-400" />
                    <span>{center.contactNumber}</span>
                  </div>
                </div>

                {/* Slot Capacity Bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Slot Capacity Booked:</span>
                    <span className="font-bold text-slate-800">
                      {center.bookedSlots} / {center.totalCapacity} ({capacityPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        capacityPercent > 85 ? 'bg-rose-500' : capacityPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Operational Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-tiny text-slate-400 block">Queue Wait</span>
                    <span className="font-bold font-mono text-amber-700">~{center.avgWaitTimeMinutes} mins</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-tiny text-slate-400 block">In Queue</span>
                    <span className="font-bold font-mono text-slate-800">{center.currentQueueCount} vehicles</span>
                  </div>
                  <div>
                    <span className="text-tiny text-slate-400 block">Counters</span>
                    <span className="font-bold font-mono text-emerald-700">{center.activeCounters} Online</span>
                  </div>
                </div>

                {/* Supported Crops */}
                <div className="mt-4">
                  <span className="text-tiny font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Supported Commodities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {center.supportedCrops.map(crop => (
                      <span key={crop} className="rounded-md bg-slate-100 px-2 py-0.5 text-tiny font-medium text-slate-700">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectActive(center.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? '✓ Active Center' : 'Set as Active'}
                </button>

                <Link
                  to="/procurement/schedules"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Book Slot <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
