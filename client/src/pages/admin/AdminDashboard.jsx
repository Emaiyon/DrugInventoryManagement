import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Pill,
  Boxes,
  DollarSign,
  AlertTriangle,
  Clock,
  Building2,
  ShoppingCart,
  Truck,
  ArrowRight,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await dashboardAPI.getAdmin();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching real-time DrugTrack analytics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-rose-600 font-semibold">{error || 'No data returned'}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { cards, charts, recentOrders, lowStockItems } = data;

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Supply Chain Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pharmaceutical oversight, cold-chain telemetry, and inventory analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh Data
          </button>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Generate Report
          </Link>
        </div>
      </div>

      {/* 8 Required Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Drugs"
          value={cards.totalDrugs.toLocaleString()}
          icon={Pill}
          color="emerald"
          subtitle="Active pharmaceutical formulations"
        />
        <StatCard
          title="Total Inventory"
          value={`${cards.totalInventory.toLocaleString()} units`}
          icon={Boxes}
          color="blue"
          subtitle="Distributed across 10 hubs"
        />
        <StatCard
          title="Inventory Value"
          value={`$${cards.inventoryValue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          subtitle="Asset valuation (MSRP)"
        />
        <StatCard
          title="Low / Depleted Stock"
          value={cards.lowStock}
          icon={AlertTriangle}
          color={cards.lowStock > 0 ? 'rose' : 'emerald'}
          subtitle="Batches requiring reorder"
        />
        <StatCard
          title="Expiring Soon"
          value={cards.expiringSoon}
          icon={Clock}
          color={cards.expiringSoon > 0 ? 'amber' : 'emerald'}
          subtitle="Within next 90 days"
        />
        <StatCard
          title="Active Suppliers"
          value={cards.activeSuppliers}
          icon={Building2}
          color="cyan"
          subtitle="Verified pharmaceutical partners"
        />
        <StatCard
          title="Pending Orders"
          value={cards.pendingOrders}
          icon={ShoppingCart}
          color="amber"
          subtitle="Awaiting fulfillment / dispatch"
        />
        <StatCard
          title="Shipments In Transit"
          value={cards.shipmentsInTransit}
          icon={Truck}
          color="blue"
          subtitle="Active cold-chain routes"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Orders & Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Order Volume & Revenue Trend</h3>
              <p className="text-xs text-slate-500">Monthly order totals and disbursement</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyOrders}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'revenue' ? `$${Number(val).toLocaleString()}` : val,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Drug Categories Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Drug Therapeutic Categories</h3>
              <p className="text-xs text-slate-500">Distribution of active medicinal catalog</p>
            </div>
            <Link to="/admin/drugs" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.drugCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.drugCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} drugs`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Inventory Overview by Warehouse */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hub Inventory Stock Levels</h3>
              <p className="text-xs text-slate-500">Total units stored by regional distribution facility</p>
            </div>
            <Link to="/admin/warehouses" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Warehouses <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="warehouseName" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()} units`, 'Units']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="units" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Shipment Pipeline Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shipment Pipeline Status</h3>
              <p className="text-xs text-slate-500">Live active transit stages</p>
            </div>
            <Link to="/admin/shipments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Track All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.shipmentStatuses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="status" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                <Tooltip
                  formatter={(val) => [`${val} shipments`, 'Shipments']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Latest hospital & pharmacy disbursements</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 truncate max-w-[140px]">
                      {order.supplier?.companyName || 'Supplier'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Low Stock / Expiry Watchlist</h3>
              <p className="text-xs text-slate-500">Batches needing immediate procurement or rotation</p>
            </div>
            <Link to="/admin/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Drug</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      All inventory batches maintain healthy stock reserves.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.drug?.name || 'Drug'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {item.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600">
                        {item.quantity} units
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
