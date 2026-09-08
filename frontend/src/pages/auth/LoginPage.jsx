import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Truck, 
  FlaskConical, 
  Gavel, 
  PackageCheck, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useProcurement, APMC_ROLES } from '../../context/ProcurementContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentRole, showToast } = useProcurement();

  const [selectedRoleId, setSelectedRoleId] = useState('admin');
  const [email, setEmail] = useState('admin@krayasutra.gov.in');
  const [password, setPassword] = useState('apmc@2026');
  const [rememberMe, setRememberMe] = useState(true);

  // Map icon strings to Lucide components
  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'gate_operator':
        return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'weighbridge_operator':
        return <Scale className="w-5 h-5 text-amber-600" />;
      case 'quality_assayer':
        return <FlaskConical className="w-5 h-5 text-sky-600" />;
      case 'auction_officer':
        return <Gavel className="w-5 h-5 text-purple-600" />;
      case 'procurement_officer':
        return <PackageCheck className="w-5 h-5 text-indigo-600" />;
      case 'accounts_officer':
        return <CreditCard className="w-5 h-5 text-teal-600" />;
      case 'admin':
      default:
        return <ShieldCheck className="w-5 h-5 text-rose-600" />;
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRoleId(role.id);
    setEmail(`${role.id.replace('_', '.')}@apmc.gov.in`);
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    const roleObj = APMC_ROLES.find(r => r.id === selectedRoleId) || APMC_ROLES[6];
    setCurrentRole(selectedRoleId);
    showToast(`Welcome back! Signed in as ${roleObj.title}`);
    navigate(roleObj.dashboardPath);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-900/40">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">Kraya Sutra</span>
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                APMC Staff Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Farmer Procurement & Mandi Management</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span>KMS Rabi Season 2025–26</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-medium">Govt Mandis Active</span>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-4xl bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to APMC Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Select your operational desk or administrative role to access real-time procurement consoles.
            </p>
          </div>

          {/* Role Selection Matrix (7 Roles) */}
          <div className="mb-8">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center sm:text-left">
              Step 1: Select Your Operational Role (Login As)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {APMC_ROLES.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                          {getRoleIcon(role.id)}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs">{role.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{role.desk}</span>
                      <span className="text-emerald-400 font-semibold">{role.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="max-w-lg mx-auto space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Staff Email / Officer ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Passcode / Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded"
                  />
                  <span>Keep desk session active</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">Demo Auto-Fill Enabled</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <span>Access {APMC_ROLES.find(r => r.id === selectedRoleId)?.title} Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Product Boundary Notice */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 max-w-xl mx-auto flex items-start gap-2.5 text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-slate-200">Product Boundary Notice:</strong> This platform is strictly for APMC yard staff, operators, and administrators. Farmers access their procurement tokens, slot bookings, and receipts through the separate <em>Farmer Mobile App</em>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 APMC Market Committee • Government of Maharashtra • DoCA Smart Procurement Platform (PS 26032)
      </footer>
    </div>
  );
}
