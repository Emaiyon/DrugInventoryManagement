import React, { useState, useEffect } from 'react';
import { shipmentsAPI } from '../../services/api';
import ShipmentTracker from '../../components/ShipmentTracker';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Truck, Search, MapPin, Thermometer, Radio } from 'lucide-react';

const SupplierShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [activeShipment, setActiveShipment] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shipmentsAPI.getAll({ limit: 50, search }).then((res) => {
      if (res.data?.success) {
        const list = res.data.shipments || [];
        setShipments(list);
        if (!activeShipment && list.length > 0) setActiveShipment(list[0]);
      }
      setLoading(false);
    });
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dispatched Shipments & Transit Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your dispatched pharmaceuticals, cold-chain telemetry, and estimated hospital deliveries.
        </p>
      </div>

      {/* Prominent Visual Stepper */}
      {activeShipment && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Live Shipment Tracker Pipeline
          </span>
          <ShipmentTracker shipment={activeShipment} />
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking number (TRK-...) or shipment ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Tracking shipments..." />
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No active shipments found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Shipment ID</th>
                  <th className="py-3 px-4">Tracking Number</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Current Location</th>
                  <th className="py-3 px-4">Temp Sensor</th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((shp) => (
                  <tr
                    key={shp._id}
                    onClick={() => setActiveShipment(shp)}
                    className={`cursor-pointer transition-colors ${
                      activeShipment?._id === shp._id ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{shp.shipmentId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{shp.trackingNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{shp.carrier}</td>
                    <td className="py-3.5 px-4 text-slate-700">{shp.currentLocation || 'In Transit'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveShipment(shp);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierShipments;
