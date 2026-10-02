import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI, suppliersAPI, drugsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import TablePagination from '../../components/TablePagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';

const ORDER_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // References
  const [suppliersList, setSuppliersList] = useState([]);
  const [drugsList, setDrugsList] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Add order form
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([
    { drug: '', drugName: '', quantity: 100, unitPrice: 20 },
  ]);
  const [shippingAddress, setShippingAddress] = useState('Metro General Hospital Pharmacy, Central Depot');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [orderNotes, setOrderNotes] = useState('Urgent hospital restocking request');

  // Edit status form
  const [editStatus, setEditStatus] = useState('CONFIRMED');
  const [editPayment, setEditPayment] = useState('PENDING');

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll({
        page,
        limit,
        search,
        status: statusFilter,
      });
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    Promise.all([
      suppliersAPI.getAll({ limit: 100 }),
      drugsAPI.getAll({ limit: 100 }),
    ]).then(([sRes, dRes]) => {
      if (sRes.data?.suppliers) {
        setSuppliersList(sRes.data.suppliers);
        if (sRes.data.suppliers[0]) setSelectedSupplier(sRes.data.suppliers[0]._id);
      }
      if (dRes.data?.drugs) {
        setDrugsList(dRes.data.drugs);
        if (dRes.data.drugs[0]) {
          setOrderItems([
            {
              drug: dRes.data.drugs[0]._id,
              drugName: dRes.data.drugs[0].name,
              quantity: 150,
              unitPrice: dRes.data.drugs[0].price,
            },
          ]);
        }
      }
    });
  }, []);

  const handleOpenAdd = () => {
    setFormError('');
    if (suppliersList[0]) setSelectedSupplier(suppliersList[0]._id);
    if (drugsList[0]) {
      setOrderItems([
        {
          drug: drugsList[0]._id,
          drugName: drugsList[0].name,
          quantity: 200,
          unitPrice: drugsList[0].price,
        },
      ]);
    }
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setExpectedDelivery(d.toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleAddItemRow = () => {
    if (drugsList.length > 0) {
      setOrderItems([
        ...orderItems,
        {
          drug: drugsList[0]._id,
          drugName: drugsList[0].name,
          quantity: 100,
          unitPrice: drugsList[0].price,
        },
      ]);
    }
  };

  const handleRemoveItemRow = (idx) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== idx));
    }
  };

  const handleItemDrugChange = (idx, drugId) => {
    const drug = drugsList.find((d) => d._id === drugId);
    if (drug) {
      const updated = [...orderItems];
      updated[idx] = {
        ...updated[idx],
        drug: drug._id,
        drugName: drug.name,
        unitPrice: drug.price,
      };
      setOrderItems(updated);
    }
  };

  const handleItemQtyChange = (idx, qty) => {
    const updated = [...orderItems];
    updated[idx].quantity = Math.max(1, Number(qty) || 1);
    setOrderItems(updated);
  };

  const calculatedTotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      await ordersAPI.create({
        supplier: selectedSupplier,
        items: orderItems,
        shippingAddress,
        expectedDelivery,
        notes: orderNotes,
      });
      setIsAddModalOpen(false);
      fetchOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error placing order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPayment(order.paymentStatus);
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await ordersAPI.update(selectedOrder._id, {
        orderStatus: editStatus,
        paymentStatus: editPayment,
      });
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setActionLoading(true);
      await ordersAPI.delete(selectedOrder._id);
      setIsDeleteModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting order');
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
            Purchase Orders & Procurement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Procurement requests, supplier invoices, payment records, and dispatch confirmations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      {/* Filter and Search */}
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
            placeholder="Search by order ID (e.g. ORD-2026-0101)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Order Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Querying order records..." />
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or create a new procurement order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items / Total Qty</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.orderId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {order.supplier?.companyName || 'Apex BioPharma'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        By {order.customer?.name || 'Pharmacy Mgr'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">
                        {order.items?.length || 1} product(s)
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {order.totalQuantity} total units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.paymentStatus} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Change Order Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Cancel/Delete Order"
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

      {/* Create Order Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Procurement Order"
          maxWidth="max-w-3xl"
        >
          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Supplier Partner *</label>
                <select
                  required
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  {suppliersList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.companyName} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Order Items & Quantities</label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Drug Row
                </button>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.drug}
                      onChange={(e) => handleItemDrugChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {drugsList.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} (${Number(d.price).toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                      className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      placeholder="Qty"
                    />

                    <span className="w-24 font-bold text-slate-700 text-right pr-2">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </span>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 text-sm font-bold text-slate-900">
                Estimated Total: ${calculatedTotal.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital Delivery Destination</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Place Purchase Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Order Status Modal */}
      {isEditModalOpen && selectedOrder && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Update Order Status — ${selectedOrder.orderId}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Status Lifecycle</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="PENDING">PENDING (Awaiting Review)</option>
                <option value="CONFIRMED">CONFIRMED (Accepted by Supplier)</option>
                <option value="PROCESSING">PROCESSING (Packing in Warehouse)</option>
                <option value="SHIPPED">SHIPPED (En Route)</option>
                <option value="DELIVERED">DELIVERED (Received at Destination)</option>
                <option value="CANCELLED">CANCELLED (Terminated)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={editPayment}
                onChange={(e) => setEditPayment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Save Order Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Order Invoice Details — ${selectedOrder.orderId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedOrder.orderId}</h4>
                <p className="text-slate-500">Ordered on {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedOrder.paymentStatus} size="xs" />
                <StatusBadge status={selectedOrder.orderStatus} size="md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                <span className="font-bold text-slate-800">{selectedOrder.supplier?.companyName}</span>
                <span className="block text-slate-400">{selectedOrder.supplier?.email}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Shipping Address</span>
                <span className="font-semibold text-slate-800">{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            {/* Line items */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2">Itemized Formulations</h5>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-2.5">Drug Name</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Unit Price</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-slate-800">{it.drugName}</td>
                        <td className="p-2.5">{it.quantity}</td>
                        <td className="p-2.5">${Number(it.unitPrice).toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">${Number(it.subtotal).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/50 font-bold border-t border-slate-100">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right text-slate-600">Total Invoice Amount:</td>
                      <td className="p-2.5 text-right text-emerald-700 text-sm">${selectedOrder.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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
        title="Cancel Purchase Order"
        message={`Are you sure you want to cancel Order ${selectedOrder?.orderId}?`}
      />
    </div>
  );
};

export default OrderManagement;
