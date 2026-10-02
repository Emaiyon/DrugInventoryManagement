import React, { useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../../services/api';
import { useAlerts } from '../../contexts/AlertContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const ALERT_SEVERITIES = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];
const ALERT_TYPES = [
  'ALL',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'EXPIRING_SOON',
  'EXPIRED',
  'DELAYED_SHIPMENT',
  'PENDING_ORDER',
  'SYSTEM',
];

const AlertsCenter = () => {
  const { fetchAlerts: refreshGlobalAlerts } = useAlerts();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAlertsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await alertsAPI.getAll({
        severity: severityFilter,
        type: typeFilter,
        status: statusFilter === 'UNREAD' ? 'unread' : statusFilter === 'READ' ? 'read' : undefined,
        limit: 50,
      });
      if (res.data?.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, typeFilter, statusFilter]);

  useEffect(() => {
    fetchAlertsData();
  }, [fetchAlertsData]);

  const handleMarkRead = async (id) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
      refreshGlobalAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      refreshGlobalAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertsAPI.delete(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      refreshGlobalAlerts();
    } catch (err) {
      alert('Error deleting alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Alerts & Clinical Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time warnings on depleted stock, expiration milestones, and telemetry exceptions.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          Mark All As Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            <option value="ALL">All Alerts</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Severity</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            {ALERT_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Alert Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
          >
            {ALERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Scanning alert registry..." />
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">All alerts resolved</h3>
            <p className="text-xs text-slate-500 mt-1">No alerts match your filter criteria.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !alert.isRead ? 'bg-emerald-50/20' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-600'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {alert.severity === 'CRITICAL' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : alert.severity === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {alert.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkRead(alert._id)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAlert(alert._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Dismiss Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsCenter;
