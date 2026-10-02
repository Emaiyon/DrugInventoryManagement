import React, { useState, useEffect, useCallback } from 'react';
import { warehousesAPI, usersAPI } from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  Layers,
  Plus,
  Search,
  Filter,
  MapPin,
  Thermometer,
  Boxes,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Building,
} from 'lucide-react';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseDetails, setWarehouseDetails] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: '',
    },
    capacity: 75000,
    managerName: 'Warehouse Manager',
    contactNumber: '+1 (555) 200-1122',
    temperatureControlled: true,
    status: 'ACTIVE',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehousesAPI.getAll({ search, status: statusFilter });
      if (res.data?.success) {
        setWarehouses(res.data.warehouses || []);
      }
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleOpenAdd = () => {
    setFormError('');
    setFormData({
      name: '',
      code: `WH-HUB-${Math.floor(10 + Math.random() * 90)}`,
      location: {
        address: '100 Logistics Parkway',
        city: 'Dallas',
        state: 'TX',
        country: 'USA',
        zipCode: '75201',
      },
      capacity: 80000,
      managerName: 'Lead Operations Officer',
      contactNumber: '+1 (555) 300-8899',
      temperatureControlled: true,
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await warehousesAPI.create(formData);
      setIsAddModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating warehouse');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (wh) => {
    setSelectedWarehouse(wh);
    setFormError('');
    setFormData({
      name: wh.name,
      code: wh.code,
      location: wh.location || { address: '', city: '', state: '', country: 'USA', zipCode: '' },
      capacity: wh.capacity || 50000,
      managerName: wh.managerName || '',
      contactNumber: wh.contactNumber || '',
      temperatureControlled: wh.temperatureControlled !== undefined ? wh.temperatureControlled : true,
      status: wh.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await warehousesAPI.update(selectedWarehouse._id, formData);
      setIsEditModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error updating warehouse');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenView = async (wh) => {
    setSelectedWarehouse(wh);
    try {
      const res = await warehousesAPI.getById(wh._id);
      if (res.data?.success) {
        setWarehouseDetails(res.data);
      }
    } catch (err) {
      setWarehouseDetails(null);
    }
    setIsViewModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setActionLoading(true);
      await warehousesAPI.delete(selectedWarehouse._id);
      setIsDeleteModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting warehouse');
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
            Regional Warehouses & Cold Hubs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Climate-controlled pharmaceutical distribution depositories and capacity utilization.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse Facility
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouses by name, code, city, state..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Facilities</option>
          <option value="INACTIVE">Inactive / Under Maintenance</option>
        </select>
      </div>

      {/* Grid of Warehouse Cards */}
      {loading ? (
        <LoadingSpinner text="Loading regional facilities..." />
      ) : warehouses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No warehouse facilities found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {warehouses.map((wh) => (
            <div
              key={wh._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {wh.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {wh.name}
                    </h3>
                  </div>
                  <StatusBadge status={wh.status} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {wh.location?.city}, {wh.location?.state} ({wh.location?.zipCode})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    {wh.temperatureControlled ? 'Cold Storage Active' : 'Ambient'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">
                    {wh.batchCount || 0} batches stored
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Capacity Utilization</span>
                    <span className="font-bold text-slate-800">
                      {wh.utilizationPct || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        wh.utilizationPct > 85
                          ? 'bg-rose-500'
                          : wh.utilizationPct > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, wh.utilizationPct || 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{wh.totalUnits ? wh.totalUnits.toLocaleString() : 0} units stored</span>
                    <span>Max {Number(wh.capacity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleOpenView(wh)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Stock
                </button>
                <button
                  onClick={() => handleOpenEdit(wh)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit Warehouse"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedWarehouse(wh);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Delete Warehouse"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isAddModalOpen ? 'Register Warehouse Facility' : `Edit ${selectedWarehouse?.name}`}
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
                <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Southwest Regional Hub"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="WH-SW-06"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Capacity (Units) *</label>
                <input
                  type="number"
                  min="1000"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Manager</label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Manager Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="temperatureControlled"
                checked={formData.temperatureControlled}
                onChange={(e) => setFormData({ ...formData, temperatureControlled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="temperatureControlled" className="font-semibold text-slate-700 cursor-pointer">
                Cold-Chain & Temperature Controlled Storage Active
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
                {actionLoading ? 'Saving...' : isAddModalOpen ? 'Create Warehouse' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Warehouse Stock Modal */}
      {isViewModalOpen && selectedWarehouse && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Inventory Batches at ${selectedWarehouse.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedWarehouse.name} ({selectedWarehouse.code})</h4>
                <p className="text-slate-500">{selectedWarehouse.location?.city}, {selectedWarehouse.location?.state}</p>
              </div>
              <StatusBadge status={selectedWarehouse.status} />
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-2">Stored Batches</h5>
              {warehouseDetails?.inventory?.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No inventory batches currently located here.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {warehouseDetails?.inventory?.map((inv) => (
                    <div key={inv._id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{inv.drug?.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{inv.batchNumber} • {inv.location}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{inv.quantity.toLocaleString()} units</span>
                        <StatusBadge status={inv.status} size="xs" />
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
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete ${selectedWarehouse?.name}? If batches are stored here, delete will be prevented to protect stock records.`}
      />
    </div>
  );
};

export default WarehouseManagement;
