import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../../services/api';
import Modal from '../../components/Modal';
import TablePagination from '../../components/TablePagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [actionLoading, setActionLoading] = useState(false);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await ordersAPI.update(selectedOrder._id, { orderStatus: newStatus });
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Inbound Purchase Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review hospital procurement orders, confirm delivery dates, and advance fulfillment statuses.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID (ORD-2026-...)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING">Pending Acceptance</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading purchase orders..." />
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No purchase orders found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Ordering Healthcare Facility</th>
                  <th className="py-3 px-4">Items / Total Units</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Expected Delivery</th>
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
                        {order.customer?.organization || 'Metro General Hospital'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Placed by {order.customer?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {order.totalQuantity} units ({order.items?.length || 1} drugs)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Immediate'}
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
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.orderStatus);
                            setIsStatusModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-semibold hover:bg-emerald-100"
                        >
                          Update Status
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
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedOrder && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Order Details — ${selectedOrder.orderId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedOrder.orderId}</h4>
                <p className="text-slate-500">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={selectedOrder.orderStatus} size="md" />
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5">Units</th>
                    <th className="p-2.5 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800">{it.drugName}</td>
                      <td className="p-2.5">{it.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">${Number(it.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Advance Order Status — ${selectedOrder.orderId}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Set Fulfillment Stage</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="CONFIRMED">CONFIRMED (Accept Contract Order)</option>
                <option value="PROCESSING">PROCESSING (Packing in Cold Facility)</option>
                <option value="SHIPPED">SHIPPED (Handed to Carrier)</option>
                <option value="DELIVERED">DELIVERED (Fulfilled)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700"
              >
                {actionLoading ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SupplierOrders;
