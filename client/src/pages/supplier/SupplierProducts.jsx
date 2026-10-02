import React, { useState, useEffect } from 'react';
import { drugsAPI, suppliersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Pill, Search, Plus, Eye, DollarSign, ShieldCheck } from 'lucide-react';

const SupplierProducts = () => {
  const { user } = useAuth();
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null);

  useEffect(() => {
    drugsAPI.getAll({ limit: 100, search }).then((res) => {
      if (res.data?.success) setDrugs(res.data.drugs || []);
      setLoading(false);
    });
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Supplier Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical formulations manufactured and supplied under contract.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplied drugs by brand name, generic name, category..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner text="Loading product portfolio..." />
      ) : drugs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No products match</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drugs.map((drug) => (
            <div
              key={drug._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Pill className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    ${Number(drug.price).toFixed(2)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{drug.name}</h3>
                  <p className="text-xs text-slate-500 italic">{drug.genericName}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                    {drug.category}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                    {drug.dosageForm} • {drug.strength}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                  {drug.description || 'Verified pharmaceutical standard formulation.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-400">
                  {drug.prescriptionRequired ? 'Prescription Only' : 'OTC Allowed'}
                </span>
                <button
                  onClick={() => setSelectedDrug(drug)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedDrug && (
        <Modal
          isOpen={!!selectedDrug}
          onClose={() => setSelectedDrug(null)}
          title={`Product Specifications — ${selectedDrug.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-base font-bold text-slate-900">{selectedDrug.name}</h4>
              <p className="text-slate-600 font-medium">Generic: {selectedDrug.genericName} • Manufacturer: {selectedDrug.manufacturer}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-slate-800">{selectedDrug.category}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contract Unit Price</span>
                <span className="font-bold text-emerald-700 text-sm">${Number(selectedDrug.price).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dosage & Strength</span>
                <span className="font-bold text-slate-800">{selectedDrug.dosageForm} ({selectedDrug.strength})</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Specification</span>
                <span className="font-semibold text-slate-800">{selectedDrug.storageConditions || 'Standard 15-25°C'}</span>
              </div>
            </div>

            {selectedDrug.description && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Clinical Indications</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{selectedDrug.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupplierProducts;
