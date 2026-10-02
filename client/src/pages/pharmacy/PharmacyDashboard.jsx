import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Pill,
  ShoppingCart,
  Clock,
  Truck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PharmacyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getPharmacy().then((res) => {
      if (res.data?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading pharmacy dispensary system..." />;

  const { cards, recentOrders, availableDrugs } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy Dispensary Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical drug dispensing, replenishment procurement orders, and dispensary inventory.
          </p>
        </div>

        <Link
          to="/pharmacy/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Order Medications
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Procurement Orders"
          value={cards?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
          subtitle="All pharmacy restock requests"
        />
        <StatCard
          title="Orders In Process"
          value={cards?.pendingOrders || 0}
          icon={Clock}
          color="amber"
          subtitle="Being fulfilled by distributors"
        />
        <StatCard
          title="Incoming Shipments"
          value={cards?.incomingShipments || 0}
          icon={Truck}
          color="emerald"
          subtitle="Dispatches in cold transit"
        />
        <StatCard
          title="Expiring Formulations"
          value={cards?.expiringSoon || 0}
          icon={AlertTriangle}
          color={cards?.expiringSoon > 0 ? 'rose' : 'emerald'}
          subtitle="Batches expiring within 90 days"
        />
      </div>

      {/* Recent Orders and Formulary Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Procurement Orders</h3>
              <p className="text-xs text-slate-500">Recent hospital replenishment requests</p>
            </div>
            <Link to="/pharmacy/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Order History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentOrders?.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No recent orders placed.</div>
            ) : (
              recentOrders?.map((ord) => (
                <div key={ord._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-mono font-bold text-slate-900">{ord.orderId}</div>
                    <div className="text-[11px] text-slate-400">
                      Supplier: {ord.supplier?.companyName || 'Apex BioPharma'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">${Number(ord.totalAmount).toLocaleString()}</span>
                    <StatusBadge status={ord.orderStatus} size="xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Approved Drugs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approved Hospital Formulary</h3>
              <p className="text-xs text-slate-500">Formulations ready for clinical restocking</p>
            </div>
            <Link to="/pharmacy/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Stock Check <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {availableDrugs?.map((d) => (
              <div key={d._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-400">{d.category} • {d.strength}</div>
                  </div>
                </div>
                <span className="font-bold text-slate-800">${Number(d.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
