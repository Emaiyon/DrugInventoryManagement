import React from 'react';

const statusConfig = {
  // Inventory Statuses
  IN_STOCK: {
    label: 'In Stock',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  EXPIRING_SOON: {
    label: 'Expiring Soon',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-red-50 text-red-800 border-red-300 font-semibold',
    dot: 'bg-red-600',
  },

  // Order & Shipment Statuses
  ORDER_PLACED: {
    label: 'Order Placed',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  SHIPPED: {
    label: 'Shipped',
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500 animate-pulse',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out For Delivery',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    dot: 'bg-slate-400',
  },

  // General Statuses
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  INACTIVE: {
    label: 'Inactive',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const normalized = (status || '').toUpperCase().trim();
  const config = statusConfig[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-xs'
      : size === 'md'
      ? 'px-3 py-1 text-sm'
      : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
