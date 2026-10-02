import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { getRoleDashboardRoute } = useAuth();
  const homeRoute = getRoleDashboardRoute();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-slate-50">
          <FileQuestion className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-800">
            Route Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or API endpoint you requested does not exist on this DrugTrack cluster.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to={homeRoute}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
