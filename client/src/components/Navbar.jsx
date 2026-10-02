import React from 'react';
import { Menu, Search, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const roleLabels = {
  ADMIN: { label: 'Admin', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  SUPPLIER: { label: 'Supplier', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  WAREHOUSE_MANAGER: { label: 'Warehouse Mgr', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  PHARMACY_MANAGER: { label: 'Pharmacy Mgr', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleInfo = roleLabels[user?.role] || {
    label: user?.role || 'Staff',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drugs, batches, orders, shipments..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Telemetry pill, Notifications, Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Cold chain telemetry beacon */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cold Chain Active</span>
        </div>

        {/* System Notifications Popover */}
        <NotificationDropdown />

        {/* User Info & Badge */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-emerald-100">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {user?.name || 'Authorized User'}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {user?.organization || 'DrugTrack Network'}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
