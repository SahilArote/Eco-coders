import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Ticket,
  Scale,
  FlaskConical,
  Package,
  Gavel,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  Compass,
  LogOut,
  Receipt,
  Building2
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentRole, activeRoleObj, currentCenter } = useProcurement();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs font-bold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const navItemClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  // 7 Strictly Separated Role Sidebar Menus
  const getRoleNavItems = () => {
    switch (currentRole) {
      case 'gate_operator':
        return {
          sectionTitle: 'Gate Operations Desk',
          items: [
            { label: 'Dashboard', path: '/dashboard/gate', icon: LayoutDashboard },
            { label: 'Gate Entry', path: '/procurement/gate-entry', icon: Truck }
          ]
        };

      case 'weighbridge_operator':
        return {
          sectionTitle: 'Weighbridge Desk',
          items: [
            { label: 'Dashboard', path: '/dashboard/weighbridge', icon: LayoutDashboard },
            { label: 'Pending Weighments', path: '/procurement/weighbridge', icon: Clock },
            { label: 'Weighbridge', path: '/procurement/weighbridge', icon: Scale },
            { label: 'Weighment History', path: '/procurement/weighbridge', icon: CheckCircle2 },
            { label: 'Weight Slips', path: '/documents/weighment-slips', icon: Receipt }
          ]
        };

      case 'quality_assayer':
        return {
          sectionTitle: 'Quality & Assay Lab',
          items: [
            { label: 'Dashboard', path: '/dashboard/quality', icon: LayoutDashboard },
            { label: 'Pending Assays', path: '/procurement/quality', icon: Clock },
            { label: 'Quality Testing', path: '/procurement/quality', icon: FlaskConical },
            { label: 'Assay History', path: '/procurement/quality', icon: CheckCircle2 },
            { label: 'Quality Reports', path: '/reports', icon: BarChart3 }
          ]
        };

      case 'auction_officer':
        return {
          sectionTitle: 'Auction Bidding Floor',
          items: [
            { label: 'Dashboard', path: '/dashboard/auction', icon: LayoutDashboard },
            { label: 'Auction Lots', path: '/procurement/lots', icon: Package },
            { label: 'Live Auctions', path: '/procurement/auctions', icon: Gavel },
            { label: 'Bid History', path: '/procurement/auctions', icon: Clock },
            { label: 'Completed Auctions', path: '/procurement/auctions', icon: CheckCircle2 }
          ]
        };

      case 'procurement_officer':
        return {
          sectionTitle: 'Procurement Cell',
          items: [
            { label: 'Dashboard', path: '/dashboard/procurement', icon: LayoutDashboard },
            { label: 'Procurement Lots', path: '/procurement/lots', icon: Package },
            { label: 'Approved Lots', path: '/procurement/lots', icon: CheckCircle2 },
            { label: 'Settlement', path: '/payments/pending', icon: CreditCard },
            { label: 'Procurement History', path: '/procurement/overview', icon: FileText }
          ]
        };

      case 'accounts_officer':
        return {
          sectionTitle: 'Treasury & Accounts',
          items: [
            { label: 'Dashboard', path: '/dashboard/accounts', icon: LayoutDashboard },
            { label: 'Pending Payments', path: '/payments/pending', icon: Clock },
            { label: 'Payments', path: '/payments/overview', icon: CreditCard },
            { label: 'Payment Vouchers', path: '/documents/payment-vouchers', icon: Receipt },
            { label: 'Payment History', path: '/payments/history', icon: CheckCircle2 }
          ]
        };

      case 'admin':
      default:
        return {
          sectionTitle: 'Administration & Oversight',
          items: [
            { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
            { label: 'Operations', path: '/procurement/overview', icon: Compass },
            { label: 'Procurement', path: '/procurement/lots', icon: Package },
            { label: 'Auctions', path: '/procurement/auctions', icon: Gavel },
            { label: 'Reports', path: '/reports', icon: BarChart3 },
            { label: 'Farmers', path: '/farmers', icon: Users },
            { label: 'System Overview', path: '/settings', icon: Settings }
          ]
        };
    }
  };

  const navConfig = getRoleNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 px-4 bg-slate-50/50">
          <Link to={activeRoleObj.dashboardPath} onClick={navItemClick} className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-black shadow-xs">
              <Scale className="size-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                KRISHI-SETU
                <span className="rounded bg-amber-100 text-amber-800 text-[10px] px-1 font-bold">APMC</span>
              </span>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                Staff Workspace
              </p>
            </div>
          </Link>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        {/* Active Role Desk Indicator */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Station</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              {activeRoleObj.badge}
            </span>
          </div>
          <p className="text-xs font-extrabold text-slate-800 mt-1 truncate">{activeRoleObj.title}</p>
          <p className="text-[10px] text-slate-500 truncate">{activeRoleObj.desk}</p>
        </div>

        {/* Role-Specific Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {navConfig.sectionTitle}
          </div>

          {navConfig.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`${item.path}-${idx}`}
                to={item.path}
                end={item.path.includes('/dashboard')}
                onClick={navItemClick}
                className={navLinkClass}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 truncate font-medium">
              <Building2 className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{currentCenter.name}</span>
            </span>
            <span className="size-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Online" />
          </div>

          <Link
            to="/login"
            onClick={navItemClick}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <LogOut className="size-3.5 text-slate-500" />
            <span>Switch Desk / Log Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
