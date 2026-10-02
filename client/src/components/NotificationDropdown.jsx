import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useAlerts } from '../contexts/AlertContext';
import { Link } from 'react-router-dom';

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'CRITICAL':
      return <AlertCircle className="w-4 h-4 text-rose-600" />;
    case 'WARNING':
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    default:
      return <Info className="w-4 h-4 text-sky-600" />;
  }
};

const NotificationDropdown = () => {
  const { alerts, unreadCount, markRead, markAllRead } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-sm">System Alerts</h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active notifications or alerts.
              </div>
            ) : (
              alerts.slice(0, 6).map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => !alert.isRead && markRead(alert._id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                    !alert.isRead ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="pt-0.5 flex-shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          !alert.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {alert.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <Link
              to="/admin/alerts"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              View all alerts in Alerts Center
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
