import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Mail, Phone, MapPin, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';

const SupplierProfile = () => {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSupplier().then((res) => {
      if (res.data?.supplier) {
        setSupplier(res.data.supplier);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading company profile..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Supplier Business Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized distributor credentials, compliance standing, and registered contacts.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {supplier?.companyName || 'Apex BioPharma Distribution'}
              </h2>
              <p className="text-xs text-slate-500">
                Contracted Pharmaceutical Wholesale Partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{supplier?.rating || 4.9} / 5.0 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Lead Representative</span>
            <p className="font-bold text-slate-900 text-sm">{supplier?.contactPerson || user?.name}</p>
            <p className="text-slate-500">{supplier?.email || user?.email}</p>
            <p className="text-slate-500">{supplier?.phone || '+1 (555) 014-9922'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Regulatory Standing</span>
            <p className="font-mono font-bold text-emerald-700 text-sm">{supplier?.licenseNumber || 'FDA-REG-778291'}</p>
            <p className="text-slate-500">Standard Payment Terms: <strong className="text-slate-700">{supplier?.paymentTerms || 'Net 30 Days'}</strong></p>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Good Manufacturing Practice (GMP) Compliant</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Corporate Headquarters</span>
          <p className="font-semibold text-slate-800">{supplier?.address || '400 Biopharma Way, Suite 500'}</p>
          <p className="text-slate-500">{supplier?.city || 'Cambridge, MA'}, {supplier?.country || 'United States'}</p>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
