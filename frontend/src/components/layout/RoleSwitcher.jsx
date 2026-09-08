import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Scale, 
  FlaskConical, 
  Gavel, 
  PackageCheck, 
  CreditCard, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useProcurement, APMC_ROLES } from '../../context/ProcurementContext';

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole, activeRoleObj } = useProcurement();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'gate_operator':
        return <Truck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'weighbridge_operator':
        return <Scale className="w-3.5 h-3.5 text-amber-600" />;
      case 'quality_assayer':
        return <FlaskConical className="w-3.5 h-3.5 text-sky-600" />;
      case 'auction_officer':
        return <Gavel className="w-3.5 h-3.5 text-purple-600" />;
      case 'procurement_officer':
        return <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'accounts_officer':
        return <CreditCard className="w-3.5 h-3.5 text-teal-600" />;
      case 'admin':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  const handleSelectRole = (role) => {
    setCurrentRole(role.id);
    setIsOpen(false);
    navigate(role.dashboardPath);
  };

  return (
    <div className="relative">
      {/* Active Role Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all text-xs font-semibold text-slate-800 cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {getRoleIcon(currentRole)}
          <span className="hidden sm:inline font-bold">{activeRoleObj.title}</span>
          <span className="sm:hidden font-bold">{activeRoleObj.shortTitle}</span>
        </span>
        <span className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono">
          {activeRoleObj.badge}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Picker Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2">
              <span className="font-bold text-slate-900 block text-xs">Switch Operational Role</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Test APMC operations from any staff perspective.</p>
            </div>

            <div className="py-1 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
              {APMC_ROLES.map((role) => {
                const isActive = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {getRoleIcon(role.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{role.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{role.desk} • {role.badge}</p>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-b-xl flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Frontend Demo Simulation
              </span>
              <span className="font-mono text-[10px]">7 Staff Roles</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
