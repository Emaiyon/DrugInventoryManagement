import React, { useState, useEffect, useCallback } from 'react';
import {
  inventoryAPI,
  drugsAPI,
  suppliersAPI,
  warehousesAPI,
} from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import TablePagination from '../../components/TablePagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [sort, setSort] = useState('createdAt');
  const [loading, setLoading] = useState(true);

  // Form options
  const [drugsList, setDrugsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    drug: '',
    batchNumber: '',
    quantity: 100,
    unitPrice: 15.0,
    supplier: '',
    warehouse: '',
    manufacturingDate: '',
    expiryDate: '',
    minimumStockLevel: 50,
    location: 'Aisle 1, Rack A',
    notes: '',
  });

  // Adjust stock state
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Hospital dispensing request');
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search,
        status: statusFilter,
        warehouse: warehouseFilter,
        sort,
      };
      const res = await inventoryAPI.getAll(params);
      if (res.data?.success) {
        setInventory(res.data.inventory || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, warehouseFilter, sort]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Load dropdown lists on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [dRes, sRes, wRes] = await Promise.all([
          drugsAPI.getAll({ limit: 100 }),
          suppliersAPI.getAll({ limit: 50 }),
          warehousesAPI.getAll({}),
        ]);
        if (dRes.data?.drugs) setDrugsList(dRes.data.drugs);
        if (sRes.data?.suppliers) setSuppliersList(sRes.data.suppliers);
        if (wRes.data?.warehouses) setWarehousesList(wRes.data.warehouses);
      } catch (err) {
        console.error('Error fetching dropdown references', err);
      }
    };
    loadDropdownData();
  }, []);

  const handleOpenAdd = () => {
    setFormError('');
    setFormData({
      drug: drugsList[0]?._id || '',
      batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
      quantity: 500,
      unitPrice: drugsList[0]?.price || 20.0,
      supplier: suppliersList[0]?._id || '',
      warehouse: warehousesList[0]?._id || '',
      manufacturingDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minimumStockLevel: 50,
      location: 'Aisle 1, Rack A',
      notes: 'Initial production batch receipt',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await inventoryAPI.create(formData);
      setIsAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating inventory record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormError('');
    setFormData({
      drug: item.drug?._id || item.drug,
      batchNumber: item.batchNumber,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplier: item.supplier?._id || item.supplier,
      warehouse: item.warehouse?._id || item.warehouse,
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      minimumStockLevel: item.minimumStockLevel || 50,
      location: item.location || '',
      notes: item.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await inventoryAPI.update(selectedItem._id, formData);
      setIsEditModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error updating inventory batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustAmount(0);
    setAdjustReason('Physical audit adjustment');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustAmount || adjustAmount === 0) return;
    try {
      setActionLoading(true);
      await inventoryAPI.adjustStock(selectedItem._id, {
        adjustment: Number(adjustAmount),
        reason: adjustReason,
      });
      setIsAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setActionLoading(true);
      await inventoryAPI.delete(selectedItem._id);
      setIsDeleteModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting inventory batch');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory & Batch Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete track & trace for all pharmaceutical batches, expiration monitoring, and automated status calculations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Inventory Batch
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by drug name, batch #, or location..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            <option value="ALL">All Hubs</option>
            {warehousesList.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            <option value="createdAt">Newest First</option>
            <option value="expiry_asc">Expiry (Earliest First)</option>
            <option value="expiry_desc">Expiry (Latest First)</option>
            <option value="quantity_asc">Quantity (Low to High)</option>
            <option value="quantity_desc">Quantity (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Querying inventory batches..." />
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No inventory batches found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new batch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Drug & Category</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Qty / Min</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Warehouse & Shelf</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.drug?.name || 'Unnamed Drug'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.drug?.category} • {item.drug?.strength}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {item.batchNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${item.quantity <= item.minimumStockLevel ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.quantity.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[11px]"> / {item.minimumStockLevel}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700 truncate max-w-[130px]">
                        {item.warehouse?.name || 'Central'}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                          title="Quick Stock Adjustment"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Batch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Batch"
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

        {/* Pagination Bar */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Inventory Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isAddModalOpen ? 'Register New Inventory Batch' : `Edit Batch ${selectedItem?.batchNumber}`}
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
                <label className="block font-semibold text-slate-700 mb-1">Drug Formulation *</label>
                <select
                  required
                  value={formData.drug}
                  onChange={(e) => setFormData({ ...formData, drug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Drug</option>
                  {drugsList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity (Units) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                <select
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Supplier</option>
                  {suppliersList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Hub *</label>
                <select
                  required
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Warehouse</option>
                  {warehousesList.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturing Date *</label>
                <input
                  type="date"
                  required
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Safe Stock Level</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minimumStockLevel}
                  onChange={(e) => setFormData({ ...formData, minimumStockLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shelf / Aisle Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Storage conditions, batch certificate notes..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
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
                {actionLoading ? 'Saving...' : isAddModalOpen ? 'Create Batch' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Stock Adjustment — Batch ${selectedItem.batchNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="text-slate-500">Current Stock in Warehouse:</p>
              <p className="text-xl font-bold text-slate-900">{selectedItem.quantity} units</p>
              <p className="text-[11px] text-slate-400">{selectedItem.drug?.name} ({selectedItem.warehouse?.name})</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Adjustment Amount (use negative to reduce stock, e.g. -50)
              </label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                New resulting stock: <strong>{Math.max(0, selectedItem.quantity + (Number(adjustAmount) || 0))}</strong> units
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Reason</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Reason for stock movement..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || adjustAmount === 0}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Confirm Adjustment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Batch Details Modal */}
      {isViewModalOpen && selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Batch Details — ${selectedItem.batchNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedItem.drug?.name}</h4>
                <p className="text-slate-500">{selectedItem.drug?.genericName} • {selectedItem.drug?.category}</p>
              </div>
              <StatusBadge status={selectedItem.status} size="md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                <span className="text-base font-bold text-slate-900">{selectedItem.quantity.toLocaleString()} units</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit Price</span>
                <span className="text-base font-bold text-slate-900">${Number(selectedItem.unitPrice).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Min Stock Level</span>
                <span className="text-base font-bold text-slate-900">{selectedItem.minimumStockLevel} units</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Warehouse</span>
                <span className="font-semibold text-slate-800">{selectedItem.warehouse?.name}</span>
                <span className="block text-[11px] text-slate-400">{selectedItem.location}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                <span className="font-semibold text-slate-800">{selectedItem.supplier?.companyName}</span>
                <span className="block text-[11px] text-slate-400">{selectedItem.supplier?.contactPerson}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiration Date</span>
                <span className="font-semibold text-slate-800">{new Date(selectedItem.expiryDate).toLocaleDateString()}</span>
                <span className="block text-[11px] text-slate-400">Mfg: {new Date(selectedItem.manufacturingDate).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedItem.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Batch Audit Log & Notes</span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
        loading={actionLoading}
        title="Delete Inventory Batch"
        message={`Are you sure you want to permanently delete Batch ${selectedItem?.batchNumber} (${selectedItem?.drug?.name})? This action cannot be reversed.`}
      />
    </div>
  );
};

export default InventoryManagement;
