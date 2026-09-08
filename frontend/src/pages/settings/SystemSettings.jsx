import { useState } from 'react';
import { 
  Building2, 
  Coins, 
  Sliders, 
  RefreshCw, 
  Save, 
  Clock, 
  Database
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function SystemSettings() {
  const { centers, crops, resetDemoData, showToast } = useProcurement();
  const [activeTab, setActiveTab] = useState('centers'); // 'centers' | 'crops' | 'preferences' | 'system'
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Center & Crops lists
  const centerList = centers;
  const cropList = crops;
  // System prefs
  const [preferences, setPreferences] = useState({
    autoRefreshQueue: true,
    refreshInterval: 15,
    smsAlerts: true,
    whatsappAlerts: true,
    biometricVerify: false,
    soundChime: true,
    currencySymbol: '₹',
    weightUnit: 'Quintal (Qtl)',
  });

  const handleSaveSettings = (section) => {
    showToast(`${section} settings saved successfully!`, 'success');
  };

  const handleReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System & Master Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure APMC mandis, procurement MSP rates, operating limits, and UI preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2">
          {[
            { id: 'centers', label: 'APMC Centers & Capacity', icon: Building2 },
            { id: 'crops', label: 'Crop MSP & Moisture Limits', icon: Coins },
            { id: 'preferences', label: 'Platform & UI Preferences', icon: Sliders },
            { id: 'system', label: 'Data & Engine Status', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CENTERS */}
      {activeTab === 'centers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Registered Procurement Centers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage daily vehicle capacities, counters, and weighbridges.</p>
              </div>
              <button
                onClick={() => handleSaveSettings('Procurement Centers')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Center Config
              </button>
            </div>

            <div className="space-y-4">
              {centerList.map((center, idx) => (
                <div key={center.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{center.name}</h4>
                        <p className="text-xs text-slate-500">{center.district}, {center.state} • Code: <span className="font-mono">{center.id}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Daily Capacity</span>
                        <input
                          type="number"
                          defaultValue={center.totalCapacity || center.capacity || 350}
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Active Counters</span>
                        <input
                          type="number"
                          defaultValue={center.activeCounters || 6}
                          className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Operating Hours</span>
                        <div className="flex items-center gap-1 text-slate-700 font-medium py-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {center.todaySchedule || center.operatingHours || '08:00 AM - 06:00 PM'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Status</span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROPS */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Government MSP Rates & Quality Standards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Minimum Support Price (₹/Quintal) and moisture limits for KMS 2025-26.</p>
              </div>
              <button
                onClick={() => handleSaveSettings('Crop MSP & Standards')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save MSP Rates
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Crop Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Govt. MSP Rate (₹/Qtl)</th>
                    <th className="p-3">Max Moisture Limit (%)</th>
                    <th className="p-3">Foreign Matter Max (%)</th>
                    <th className="p-3">Procurement Window</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cropList.map((crop) => (
                    <tr key={crop.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800">
                        {crop.name}
                        <span className="block font-mono text-[10px] text-slate-400">{crop.code || crop.id}</span>
                      </td>
                      <td className="p-3 text-slate-600 capitalize">{crop.category || 'Cereal'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">₹</span>
                          <input
                            type="number"
                            defaultValue={crop.msp || crop.mspRate || 2400}
                            className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={crop.maxMoisturePercent || crop.maxMoisture || 12}
                            step="0.1"
                            className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={crop.maxForeignMatterPercent || crop.maxForeignMatter || 1.5}
                            step="0.1"
                            className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{crop.season || crop.procurementWindow || 'Rabi 2026'}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Platform & UI Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize real-time update triggers, display units, and notification services.</p>
              </div>
              <button
                onClick={() => handleSaveSettings('Platform Preferences')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Queue Refresh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Real-time Queue Polling</h4>
                    <p className="text-xs text-slate-500">Auto-refresh operator queue boards & token wait times.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoRefreshQueue}
                    onChange={(e) => setPreferences({ ...preferences, autoRefreshQueue: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                {preferences.autoRefreshQueue && (
                  <div className="pt-2 flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-medium">Interval:</span>
                    <select
                      value={preferences.refreshInterval}
                      onChange={(e) => setPreferences({ ...preferences, refreshInterval: Number(e.target.value) })}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value={5}>5 seconds</option>
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Farmer SMS & WhatsApp Alerts */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Farmer Dispatch Alerts</h4>
                    <p className="text-xs text-slate-500">Auto-dispatch SMS when token is within next 3 positions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsAlerts}
                    onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">WhatsApp Tak-Patti Push</h4>
                    <p className="text-xs text-slate-500">Send PDF Form J link immediately upon weighment clearance.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.whatsappAlerts}
                    onChange={(e) => setPreferences({ ...preferences, whatsappAlerts: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Units & Currency */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">Measurement Units</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Standard Weight Unit</label>
                    <select
                      value={preferences.weightUnit}
                      onChange={(e) => setPreferences({ ...preferences, weightUnit: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="Quintal (Qtl)">Quintal (100 kg)</option>
                      <option value="Metric Ton (MT)">Metric Ton (1,000 kg)</option>
                      <option value="Kilograms (kg)">Kilograms (kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Currency Format</label>
                    <select
                      value={preferences.currencySymbol}
                      onChange={(e) => setPreferences({ ...preferences, currencySymbol: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="₹">INR (₹ - Lakhs / Crores)</option>
                      <option value="INR">INR (Standard Thousands)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hardware Scale Protocol */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">Weighbridge I/O Calibration</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Protocol:</span>
                    <span className="font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-700">RS-232 / Modbus TCP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zero Tolerance Deviation:</span>
                    <span className="font-semibold text-slate-700">± 5 kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Calibration Validity:</span>
                    <span className="text-emerald-700 font-semibold">Valid till Dec 2026 (Avery Weigh-Tronix)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM & ENGINE */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-1">Client-Side Engine & Storage Status</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time inspection of reactive state, mock data tables, and storage quota.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Platform Mode</div>
                <div className="text-lg font-bold text-emerald-700 mt-1">Reactive Frontend Engine</div>
                <div className="text-[11px] text-slate-400 mt-1">Zero Backend Dependency</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Active Center</div>
                <div className="text-lg font-bold text-slate-800 mt-1">{centers[0]?.name || 'Pune APMC'}</div>
                <div className="text-[11px] text-slate-400 mt-1">{centers.length} Total Centers Registered</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Government Portal</div>
                <div className="text-lg font-bold text-blue-700 mt-1">KMS 2025-26</div>
                <div className="text-[11px] text-slate-400 mt-1">APMC & PFMS Conforming</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">State Storage</div>
                <div className="text-lg font-bold text-slate-800 mt-1">localStorage Synced</div>
                <div className="text-[11px] text-emerald-600 mt-1">Fast Persistence</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-bold text-rose-800 text-sm">Factory Reset Demo Dataset</h4>
                <p className="text-xs text-rose-600 mt-0.5">
                  Restores Ramesh Patil (Token A105, LOT-2026-001) and all 52 farmers to initial baseline demo state.
                </p>
              </div>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm transition-colors cursor-pointer"
              >
                Reset Demo Store Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Reset Demo Store?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              This will clear your local storage modifications and restore the pristine reference dataset, including farmer Ramesh Patil, token A105, active queues, and lot records.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
