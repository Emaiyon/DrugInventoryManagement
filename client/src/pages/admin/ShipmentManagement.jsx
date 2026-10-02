import React, { useState, useEffect, useCallback } from 'react';
import { shipmentsAPI, ordersAPI, warehousesAPI } from '../../services/api';
import Modal from '../../components/Modal';
import TablePagination from '../../components/TablePagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ShipmentTracker from '../../components/ShipmentTracker';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Navigation,
  Thermometer,
  MapPin,
  Clock,
  Eye,
  Edit,
  ArrowRight,
  AlertCircle,
  Radio,
} from 'lucide-react';

const SHIPMENT_STATUSES = [
  'ALL',
  'ORDER_PLACED',
  'PROCESSING',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const ShipmentManagement = () => {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Selected shipment for prominent live visual tracker view
  const [activeShipment, setActiveShipment] = useState(null);

  // Reference data
  const [ordersList, setOrdersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Add shipment state
  const [formData, setFormData] = useState({
    order: '',
    carrier: 'PharmaExpress Direct',
    originWarehouse: '',
    destination: 'Central Hospital Pharmacy, Wing B',
    temperatureReading: '3.8°C (Optimal)',
    estimatedDelivery: '',
  });

  // Update status state
  const [updateStatus, setUpdateStatus] = useState('IN_TRANSIT');
  const [currentLocation, setCurrentLocation] = useState('Interstate Freight Corridor #95');
  const [temperatureReading, setTemperatureReading] = useState('4.1°C (Optimal)');
  const [locationNote, setLocationNote] = useState('Automated GPS cold-chain checkpoint verified.');

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await shipmentsAPI.getAll({
        page,
        limit,
        search,
        status: statusFilter,
      });
      if (res.data?.success) {
        const list = res.data.shipments || [];
        setShipments(list);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        if (!activeShipment && list.length > 0) {
          setActiveShipment(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load shipments', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    Promise.all([
      ordersAPI.getAll({ limit: 100 }),
      warehousesAPI.getAll({}),
    ]).then(([oRes, wRes]) => {
      if (oRes.data?.orders) {
        setOrdersList(oRes.data.orders);
        if (oRes.data.orders[0]) setFormData((prev) => ({ ...prev, order: oRes.data.orders[0]._id }));
      }
      if (wRes.data?.warehouses) {
        setWarehousesList(wRes.data.warehouses);
        if (wRes.data.warehouses[0]) setFormData((prev) => ({ ...prev, originWarehouse: wRes.data.warehouses[0]._id }));
      }
    });
  }, []);

  const handleOpenAdd = () => {
    setFormError('');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFormData({
      order: ordersList[0]?._id || '',
      carrier: 'PharmaExpress Direct',
      originWarehouse: warehousesList[0]?._id || '',
      destination: 'Central Hospital Pharmacy, Wing B',
      temperatureReading: '3.9°C (Optimal)',
      estimatedDelivery: d.toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setActionLoading(true);
      const res = await shipmentsAPI.create(formData);
      setIsAddModalOpen(false);
      fetchShipments();
      if (res.data?.shipment) setActiveShipment(res.data.shipment);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenUpdate = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateStatus(shipment.status);
    setCurrentLocation(shipment.currentLocation || 'Logistics Transfer Terminal');
    setTemperatureReading(shipment.temperatureReading || '4.0°C (Optimal)');
    setLocationNote(`Transit status updated to ${shipment.status}`);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await shipmentsAPI.update(selectedShipment._id, {
        status: updateStatus,
        currentLocation,
        temperatureReading,
        locationNote,
      });
      setIsUpdateModalOpen(false);
      fetchShipments();
      if (res.data?.shipment) setActiveShipment(res.data.shipment);
    } catch (err) {
      alert(err.response?.data?.message || 'Error advancing shipment status');
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
            Cold-Chain Logistics & Shipment Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS coordinates, live IoT temperature telemetry, and 6-stage transit lifecycle tracking.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Dispatch New Shipment
        </button>
      </div>

      {/* Visual Live Stepper Tracker Section */}
      {activeShipment && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Live Visual Progress Pipeline
            </span>
            <button
              onClick={() => handleOpenUpdate(activeShipment)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Advance Route Stage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ShipmentTracker shipment={activeShipment} />
        </div>
      )}

      {/* Search and Filters */}
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
            placeholder="Search by tracking number (TRK-...), shipment ID, carrier, destination..."
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
            {SHIPMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Transit Stages' : st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Querying shipment pipeline..." />
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No shipments found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or dispatch a new shipment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Shipment & Tracking #</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Origin Hub</th>
                  <th className="py-3 px-4">Telemetry Location</th>
                  <th className="py-3 px-4">Temp Sensor</th>
                  <th className="py-3 px-4">Est. Arrival</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((shp) => (
                  <tr
                    key={shp._id}
                    onClick={() => setActiveShipment(shp)}
                    className={`cursor-pointer transition-colors ${
                      activeShipment?._id === shp._id
                        ? 'bg-emerald-50/40'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{shp.shipmentId}</div>
                      <div className="font-mono text-[11px] text-slate-500">{shp.trackingNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {shp.carrier}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {shp.originWarehouse?.name || 'Central Hub'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shp.currentLocation || 'In Transit'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Thermometer className="w-3 h-3 text-emerald-600" />
                        {shp.temperatureReading || '4.0°C'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {shp.estimatedDelivery ? new Date(shp.estimatedDelivery).toLocaleDateString() : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={shp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveShipment(shp)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold hover:bg-slate-200"
                        >
                          View Tracker
                        </button>
                        <button
                          onClick={() => handleOpenUpdate(shp)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Advance Progress"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Dispatch New Shipment Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Dispatch New Pharmaceutical Shipment"
        >
          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Order *</label>
                <select
                  required
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  {ordersList.map((ord) => (
                    <option key={ord._id} value={ord._id}>
                      {ord.orderId} (${Number(ord.totalAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Provider</label>
                <input
                  type="text"
                  required
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  placeholder="PharmaExpress Direct"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin Warehouse</label>
                <select
                  required
                  value={formData.originWarehouse}
                  onChange={(e) => setFormData({ ...formData, originWarehouse: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  {warehousesList.map((wh) => (
                    <option key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Arrival Date</label>
                <input
                  type="date"
                  required
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Address</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
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
                {actionLoading ? 'Dispatching...' : 'Dispatch Shipment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Advance Progress / Checkpoint Modal */}
      {isUpdateModalOpen && selectedShipment && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Route Telemetry — ${selectedShipment.shipmentId}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transit Stage</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ORDER_PLACED">ORDER_PLACED</option>
                <option value="PROCESSING">PROCESSING (Packing in Cold Bay)</option>
                <option value="SHIPPED">SHIPPED (Departed Warehouse)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (On Highway)</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Local Courier)</option>
                <option value="DELIVERED">DELIVERED (Signed & Handed Over)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Checkpoint Location</label>
              <input
                type="text"
                required
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="City Logistics Depot, Terminal 4"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IoT Temperature Sensor Telemetry</label>
              <input
                type="text"
                required
                value={temperatureReading}
                onChange={(e) => setTemperatureReading(e.target.value)}
                placeholder="4.1°C (Optimal)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Checkpoint Log Note</label>
              <textarea
                rows={2}
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Logging...' : 'Confirm Checkpoint'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ShipmentManagement;
