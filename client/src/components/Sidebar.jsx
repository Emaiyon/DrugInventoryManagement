import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Pill,
  Truck,
  ShoppingCart,
  Building2,
  Users,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  Package,
  Layers,
  Activity,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Navigation links config per role
const navConfig = {
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Drug Catalog', path: '/admin/drugs', icon: Pill },
    { name: 'Suppliers', path: '/admin/suppliers', icon: Building2 },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Shipments', path: '/admin/shipments', icon: Truck },
    { name: 'Warehouses', path: '/admin/warehouses', icon: Layers },
    { name: 'User Access', path: '/admin/users', icon: Users },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Alerts Center', path: '/admin/alerts', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  SUPPLIER: [
    { name: 'Dashboard', path: '/supplier/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/supplier/products', icon: Pill },
    { name: 'Purchase Orders', path: '/supplier/orders', icon: ShoppingCart },
    { name: 'Shipment Tracking', path: '/supplier/shipments', icon: Truck },
    { name: 'Company Profile', path: '/supplier/profile', icon: Building2 },
  ],
  WAREHOUSE_MANAGER: [
    { name: 'Dashboard', path: '/warehouse/dashboard', icon: LayoutDashboard },
    { name: 'Stock Inventory', path: '/warehouse/inventory', icon: Boxes },
    { name: 'Dispatches & Shipments', path: '/warehouse/shipments', icon: Truck },
    { name: 'Warehouse Alerts', path: '/warehouse/alerts', icon: Bell },
  ],
  PHARMACY_MANAGER: [
    { name: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
    { name: 'Pharmacy Stock', path: '/pharmacy/inventory', icon: Boxes },
    { name: 'Drug Orders', path: '/pharmacy/orders', icon: ShoppingCart },
    { name: 'Stock Alerts', path: '/pharmacy/alerts', icon: Bell },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentRole = user?.role || 'ADMIN';
  const navItems = navConfig[currentRole] || navConfig.ADMIN;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Drug<span className="text-emerald-600">Track</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Pharma Logistics
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {currentRole.replace('_', ' ')} PORTAL
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Role badge & system version */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-white border border-slate-200/70 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Logged Role</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentRole}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>DrugTrack v1.0.0</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Activity className="w-3 h-3" /> Live
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
