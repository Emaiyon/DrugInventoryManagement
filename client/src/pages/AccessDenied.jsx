import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied = () => {
  const { user, getRoleDashboardRoute } = useAuth();
  const homeRoute = getRoleDashboardRoute();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-rose-50/50">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current assigned role (
            <span className="font-semibold text-rose-600">{user?.role || 'Guest'}</span>
            ) does not have authorization to view this secure medical module.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={homeRoute}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Go to My Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
