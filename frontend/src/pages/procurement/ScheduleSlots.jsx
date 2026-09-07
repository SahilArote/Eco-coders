import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Building2
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function ScheduleSlots() {
  const navigate = useNavigate();
  const { currentCenter, crops, bookSlot, farmers, selectedCenterId } = useProcurement();

  const [selectedDate, setSelectedDate] = useState('2026-03-05');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);

  // Form state for booking
  const [formData, setFormData] = useState({
    farmerId: 'F-1001',
    farmerName: 'Ramesh Patil',
    farmerMobile: '9822101341',
    commodity: 'Wheat',
    expectedQuantityQtl: 32.0,
    vehicleNumber: 'MH-12-AQ-4481'
  });

  // Daily Slots Mock
  const slots = [
    { id: 's-1', timeWindow: '08:00 AM - 09:00 AM', totalCapacity: 35, booked: 32, status: 'ALMOST_FULL' },
    { id: 's-2', timeWindow: '09:00 AM - 10:00 AM', totalCapacity: 35, booked: 35, status: 'FULL' },
    { id: 's-3', timeWindow: '10:00 AM - 11:00 AM', totalCapacity: 35, booked: 18, status: 'AVAILABLE', isTarget: true },
    { id: 's-4', timeWindow: '11:00 AM - 12:00 PM', totalCapacity: 35, booked: 22, status: 'AVAILABLE' },
    { id: 's-5', timeWindow: '12:00 PM - 01:00 PM', totalCapacity: 30, booked: 28, status: 'ALMOST_FULL' },
    { id: 's-6', timeWindow: '01:30 PM - 02:30 PM', totalCapacity: 35, booked: 14, status: 'AVAILABLE' },
    { id: 's-7', timeWindow: '02:30 PM - 03:30 PM', totalCapacity: 35, booked: 10, status: 'AVAILABLE' },
    { id: 's-8', timeWindow: '03:30 PM - 04:30 PM', totalCapacity: 30, booked: 8, status: 'AVAILABLE' }
  ];

  const handleOpenBooking = (slot) => {
    setSelectedSlotForBooking(slot);
    setBookingModalOpen(true);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    const token = bookSlot({
      centerId: selectedCenterId,
      commodity: formData.commodity,
      farmerId: formData.farmerId,
      farmerName: formData.farmerName,
      farmerMobile: formData.farmerMobile,
      expectedQuantityQtl: formData.expectedQuantityQtl,
      vehicleNumber: formData.vehicleNumber,
      appointmentDate: selectedDate,
      appointmentSlot: selectedSlotForBooking?.timeWindow || '10:00 AM - 11:00 AM'
    });

    setBookingModalOpen(false);
    navigate('/procurement/tokens');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Procurement Schedule &amp; Slots</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual capacity planner for scheduled mandi arrivals. Select a time window to book a slot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenBooking(slots[2])}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="size-3.5" /> Book 10:00 AM Slot (Demo A105)
          </button>
        </div>
      </div>

      {/* Date & Crop Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
            <CalendarIcon className="size-3.5 text-slate-400" />
            <span>Thursday, 05 Mar 2026</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="size-4" />
            </button>
            <button className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Commodity:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            {crops.map(c => (
              <option key={c.id} value={c.name}>{c.name} (MSP: ₹{c.msp})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Capacity Overview Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-tiny font-bold uppercase tracking-wider text-emerald-800">
            Active Mandi Capacity: {currentCenter.name}
          </span>
          <h3 className="text-base font-bold text-emerald-950 mt-0.5">
            278 of 350 slots booked today ({Math.round((278 / 350) * 100)}% capacity)
          </h3>
          <p className="text-xs text-emerald-800/80 mt-1">
            Staggered arrival slots prevent vehicle gridlock at the Gultekdi weighbridge gate.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-tiny font-bold text-emerald-700 block">Available Slots</span>
            <span className="text-2xl font-black font-mono text-emerald-900">72 Slots</span>
          </div>
          <div className="h-10 w-px bg-emerald-300" />
          <div className="text-right">
            <span className="text-tiny font-bold text-emerald-700 block">Counters Operating</span>
            <span className="text-2xl font-black font-mono text-emerald-900">{currentCenter.activeCounters} Scales</span>
          </div>
        </div>
      </div>

      {/* Slot Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map(slot => {
          const available = slot.totalCapacity - slot.booked;
          const isFull = slot.status === 'FULL';
          const isTarget = slot.isTarget;
          const pct = Math.round((slot.booked / slot.totalCapacity) * 100);

          return (
            <div
              key={slot.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between ${
                isTarget ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Clock className="size-3.5 text-slate-400" />
                    {slot.timeWindow}
                  </span>
                  <span className={`text-tiny font-bold rounded-full px-2 py-0.5 ${
                    isFull ? 'bg-rose-100 text-rose-800' : isTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isFull ? 'Full' : `${available} Left`}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Booked:</span>
                    <strong className="text-slate-800">{slot.booked} / {slot.totalCapacity}</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 90 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-tiny text-slate-500">
                  {selectedCrop} procurement • Scale Desk 1 &amp; 2
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => handleOpenBooking(slot)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : isTarget
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isFull ? 'Slot Unavailable' : isTarget ? '★ Book Demo Slot' : 'Select Slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Procurement Slot Booking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Time Window: <strong>{selectedSlotForBooking?.timeWindow}</strong> at <strong>{currentCenter.name}</strong>
            </p>

            <form onSubmit={handleSubmitBooking} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Farmer Profile</label>
                <select
                  value={formData.farmerId}
                  onChange={(e) => {
                    const f = farmers.find(farm => farm.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      farmerId: e.target.value,
                      farmerName: f ? f.name : prev.farmerName,
                      farmerMobile: f ? f.mobile : prev.farmerMobile
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-800"
                >
                  {farmers.slice(0, 15).map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.id} • {f.village})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commodity</label>
                  <select
                    value={formData.commodity}
                    onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-800"
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Qty (Quintals)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.expectedQuantityQtl}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedQuantityQtl: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-medium text-slate-800 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile SMS Confirmation</label>
                  <input
                    type="text"
                    disabled
                    value={`+91 ${formData.farmerMobile}`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-tiny">
                <strong>Digital Token Guarantee:</strong> Booking allocates an instant electronic token, queue priority, and SMS dispatch. No manual paperwork required.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Confirm &amp; Generate Digital Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
