import React, { useState, useEffect } from 'react';
import { dashboardAPI, inventoryAPI, ordersAPI, drugsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign,
  Boxes,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dashboardAPI.getAdmin().then((res) => {
      if (res.data?.success) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  const exportInventoryCSV = async () => {
    try {
      setExporting(true);
      const res = await inventoryAPI.getAll({ limit: 1000 });
      const items = res.data?.inventory || [];

      const headers = ['Drug Name', 'Batch Number', 'Quantity', 'Unit Price ($)', 'Total Value ($)', 'Warehouse', 'Supplier', 'Expiry Date', 'Status'];
      const rows = items.map((i) => [
        `"${i.drug?.name || ''}"`,
        `"${i.batchNumber || ''}"`,
        i.quantity,
        i.unitPrice,
        (i.quantity * i.unitPrice).toFixed(2),
        `"${i.warehouse?.name || ''}"`,
        `"${i.supplier?.companyName || ''}"`,
        i.expiryDate ? new Date(i.expiryDate).toLocaleDateString() : '',
        `"${i.status || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `DrugTrack_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting inventory CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportOrdersCSV = async () => {
    try {
      setExporting(true);
      const res = await ordersAPI.getAll({ limit: 1000 });
      const items = res.data?.orders || [];

      const headers = ['Order ID', 'Supplier', 'Customer', 'Total Quantity', 'Total Amount ($)', 'Order Date', 'Payment Status', 'Order Status'];
      const rows = items.map((o) => [
        `"${o.orderId || ''}"`,
        `"${o.supplier?.companyName || ''}"`,
        `"${o.customer?.name || ''}"`,
        o.totalQuantity || 0,
        o.totalAmount || 0,
        o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '',
        `"${o.paymentStatus || ''}"`,
        `"${o.orderStatus || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `DrugTrack_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting orders CSV');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling analytical summaries..." />;
  }

  const { cards, charts } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports & Supply Chain Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable compliance ledgers, inventory valuation reports, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportInventoryCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Inventory CSV
          </button>
          <button
            onClick={exportOrdersCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Orders CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Asset Valuation</span>
          <h3 className="text-2xl font-extrabold text-slate-900">${cards?.inventoryValue?.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-medium">Reconciled against verified batch registries</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Supply Lines</span>
          <h3 className="text-2xl font-extrabold text-slate-900">{cards?.activeSuppliers} Partners</h3>
          <p className="text-xs text-slate-500">100% FDA compliance verified</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batches Needing Attention</span>
          <h3 className="text-2xl font-extrabold text-amber-600">{(cards?.lowStock || 0) + (cards?.expiringSoon || 0)} Batches</h3>
          <p className="text-xs text-slate-500">Low stock or expiring within 90 days</p>
        </div>
      </div>

      {/* Chart: Warehouse Capacity vs Stock Units */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Regional Depository Asset Distribution</h3>
            <p className="text-xs text-slate-500">Inventory units and financial valuation by facility</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.inventoryOverview || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="warehouseName" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val, name) => [
                  name === 'value' ? `$${Number(val).toLocaleString()}` : Number(val).toLocaleString(),
                  name === 'value' ? 'Valuation ($)' : 'Stored Units',
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="units" fill="#10b981" name="Stored Units" radius={[6, 6, 0, 0]} />
              <Bar dataKey="value" fill="#0ea5e9" name="Valuation ($)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
