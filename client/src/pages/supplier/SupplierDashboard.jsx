import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Building2,
  ShoppingCart,
  Clock,
  DollarSign,
  Pill,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SupplierDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSupplier().then((res) => {
      if (res.data?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading supplier command portal..." />;

  const { cards, recentOrders, products, supplier } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Supplier Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {supplier?.companyName || 'Apex BioPharma Distribution'} • FDA License #{supplier?.licenseNumber || 'REG-778291'}
          </p>
        </div>

        <Link
          to="/supplier/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Manage Purchase Orders
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={cards?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
          subtitle="All received procurement requests"
        />
        <StatCard
          title="Pending Fulfillment"
          value={cards?.pendingOrders || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting dispatch approval"
        />
        <StatCard
          title="Dispatched / Shipped"
          value={cards?.shippedOrders || 0}
          icon={Truck}
          color="emerald"
          subtitle="Orders currently in cold transit"
        />
        <StatCard
          title="Settled Revenue"
          value={`$${(cards?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          subtitle="Paid pharmaceutical invoices"
        />
      </div>

      {/* Recent Orders and Product Catalog Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inbound Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Inbound fulfillment requests</p>
            </div>
            <Link to="/supplier/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentOrders?.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No active orders assigned.</div>
            ) : (
              recentOrders?.map((ord) => (
                <div key={ord._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-mono font-bold text-slate-900">{ord.orderId}</div>
                    <div className="text-[11px] text-slate-500">{ord.customer?.organization || ord.customer?.name}</div>
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

        {/* Product Catalog */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplied Product Portfolio</h3>
              <p className="text-xs text-slate-500">Approved formulations authorized for contract</p>
            </div>
            <Link to="/supplier/products" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {products?.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No formulations currently assigned.</div>
            ) : (
              products?.map((p) => (
                <div key={p._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.category} • {p.strength}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">${Number(p.price).toFixed(2)}/unit</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
