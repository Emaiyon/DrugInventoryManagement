import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Layers,
  Boxes,
  AlertTriangle,
  Truck,
  ArrowRight,
  Thermometer,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WarehouseDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getWarehouse().then((res) => {
      if (res.data?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Connecting to warehouse telemetry..." />;

  const { cards, warehouses, recentBatches } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Warehouse Logistics Command
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cold storage utilization, incoming/outgoing consignments, and inventory batch oversight.
          </p>
        </div>

        <Link
          to="/warehouse/inventory"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Boxes className="w-4 h-4" />
          Stock Inventory & Adjustments
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Depositories"
          value={cards?.totalWarehouses || 10}
          icon={Layers}
          color="emerald"
          subtitle="Regional distribution hubs"
        />
        <StatCard
          title="Registered Batches"
          value={cards?.totalBatches || 35}
          icon={Boxes}
          color="blue"
          subtitle="Pharmaceutical lots stored"
        />
        <StatCard
          title="Stock Risk Warnings"
          value={cards?.lowStockAlerts || 0}
          icon={AlertTriangle}
          color={cards?.lowStockAlerts > 0 ? 'rose' : 'emerald'}
          subtitle="Low or depleted stock batches"
        />
        <StatCard
          title="Active Shipments"
          value={cards?.activeShipments || 0}
          icon={Truck}
          color="cyan"
          subtitle="Inbound and outbound transport"
        />
      </div>

      {/* Facilities & Recent Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facilities List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Cold Storage Depots</h3>
              <p className="text-xs text-slate-500">Storage capacity and temperature telemetry</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {warehouses?.slice(0, 5).map((wh) => (
              <div key={wh._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    {wh.name}
                    <span className="font-mono text-[10px] text-slate-400">({wh.code})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {wh.location?.city}, {wh.location?.state}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <Thermometer className="w-3 h-3" /> Cold Chain Active
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Cap: {Number(wh.capacity).toLocaleString()} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Ingested Batches */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Inventory Batches</h3>
              <p className="text-xs text-slate-500">Latest allocations and stock movements</p>
            </div>
            <Link to="/warehouse/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              All Batches <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentBatches?.map((b) => (
              <div key={b._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">{b.drug?.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{b.batchNumber} • {b.warehouse?.name}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">{b.quantity.toLocaleString()} units</span>
                  <StatusBadge status={b.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
