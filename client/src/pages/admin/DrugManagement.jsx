import React, { useState, useEffect, useCallback } from 'react';
import { drugsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import TablePagination from '../../components/TablePagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  FileText,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Antibiotics',
  'Cardiology',
  'Antidiabetics',
  'Analgesics',
  'Gastroenterology',
  'Neurology',
  'Respiratory',
  'Psychiatry',
  'Endocrinology',
];

const DrugManagement = () => {
  const [drugs, setDrugs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [viewBatches, setViewBatches] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    manufacturer: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    price: 15.0,
    prescriptionRequired: true,
    storageConditions: 'Store at 15-25°C',
    description: '',
    status: 'ACTIVE',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDrugs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await drugsAPI.getAll({
        page,
        limit,
        search,
        category: categoryFilter,
      });
      if (res.data?.success) {
        setDrugs(res.data.drugs || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load drugs', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter]);

  useEffect(() => {
    fetchDrugs();
  }, [fetchDrugs]);

  const handleOpenAdd = () => {
    setFormError('');
    setFormData({
      name: '',
      genericName: '',
      category: 'Antibiotics',
      manufacturer: '',
      dosageForm: 'Tablet',
      strength: '500mg',
      price: 20.0,
      prescriptionRequired: true,
      storageConditions: 'Store at 15-25°C in a dry place',
      description: '',
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await drugsAPI.create(formData);
      setIsAddModalOpen(false);
      fetchDrugs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating drug');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (drug) => {
    setSelectedDrug(drug);
    setFormError('');
    setFormData({
      name: drug.name,
      genericName: drug.genericName,
      category: drug.category,
      manufacturer: drug.manufacturer,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      price: drug.price,
      prescriptionRequired: drug.prescriptionRequired,
      storageConditions: drug.storageConditions || '',
      description: drug.description || '',
      status: drug.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await drugsAPI.update(selectedDrug._id, formData);
      setIsEditModalOpen(false);
      fetchDrugs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error updating drug');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenView = async (drug) => {
    setSelectedDrug(drug);
    try {
      const res = await drugsAPI.getById(drug._id);
      if (res.data?.batches) {
        setViewBatches(res.data.batches);
      }
    } catch (err) {
      setViewBatches([]);
    }
    setIsViewModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setActionLoading(true);
      await drugsAPI.delete(selectedDrug._id);
      setIsDeleteModalOpen(false);
      fetchDrugs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting drug');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Drug Formulary & Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical formulation registry, dosage strengths, categories, and regulatory details.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Drug Formulation
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search drugs by name, generic title, manufacturer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Therapeutic Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drugs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading drug formulary..." />
        ) : drugs.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No drugs found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or add a new drug formulation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Drug & Strength</th>
                  <th className="py-3 px-4">Generic Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Form</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Rx Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drugs.map((drug) => (
                  <tr key={drug._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{drug.name}</div>
                      <div className="text-[11px] text-slate-500">{drug.strength}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 italic font-medium">
                      {drug.genericName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {drug.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {drug.manufacturer}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {drug.dosageForm}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${Number(drug.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          drug.prescriptionRequired
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {drug.prescriptionRequired ? 'Rx Required' : 'OTC'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(drug)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="View Drug & Batches"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(drug)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Drug"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDrug(drug);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Drug"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Drug Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isAddModalOpen ? 'Add New Drug Formulation' : `Edit ${selectedDrug?.name}`}
        >
          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amoxicillin Trihydrate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic Name *</label>
                <input
                  type="text"
                  required
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Amoxicillin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Therapeutic Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g. Pfizer Inc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage Form</label>
                <input
                  type="text"
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  placeholder="Tablet, Capsule, Liquid, Inhaler..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Strength</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="500mg, 10mg, 100 units/ml..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Conditions</label>
                <input
                  type="text"
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                  placeholder="Store at 15-25°C, protect from moisture"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description & Indications</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Clinical indications, contraindications, mechanism of action..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prescriptionRequired"
                checked={formData.prescriptionRequired}
                onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="prescriptionRequired" className="font-semibold text-slate-700 cursor-pointer">
                Prescription Required (Rx Only)
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : isAddModalOpen ? 'Create Drug' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Drug Modal */}
      {isViewModalOpen && selectedDrug && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Formulary Details — ${selectedDrug.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{selectedDrug.name}</h3>
              <p className="text-slate-600 font-medium mt-0.5">
                Generic: <span className="italic">{selectedDrug.genericName}</span> • Category: <span className="font-semibold text-emerald-700">{selectedDrug.category}</span>
              </p>
              {selectedDrug.description && (
                <p className="mt-2 text-slate-500 leading-relaxed text-[11px]">{selectedDrug.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dosage</span>
                <span className="font-bold text-slate-800">{selectedDrug.dosageForm}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Strength</span>
                <span className="font-bold text-slate-800">{selectedDrug.strength}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Price</span>
                <span className="font-bold text-slate-800">${Number(selectedDrug.price).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                <span className="font-bold text-slate-800 truncate block">{selectedDrug.manufacturer}</span>
              </div>
            </div>

            {/* Associated Batches in Inventory */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Active Batches in Stock ({viewBatches.length})</h4>
              {viewBatches.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No batches currently registered for this drug.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {viewBatches.map((b) => (
                    <div key={b._id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{b.batchNumber}</span>
                        <span className="text-slate-400 text-[11px] block">{b.warehouse?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{b.quantity} units</span>
                        <StatusBadge status={b.status} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
        loading={actionLoading}
        title="Delete Drug Formulation"
        message={`Are you sure you want to delete ${selectedDrug?.name}? If any inventory batches reference this drug, delete will be prevented to protect data integrity.`}
      />
    </div>
  );
};

export default DrugManagement;
