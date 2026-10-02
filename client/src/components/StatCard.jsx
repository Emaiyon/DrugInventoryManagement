import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-600',
    border: 'border-emerald-100 hover:border-emerald-200',
    pill: 'bg-emerald-50 text-emerald-700',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-500/10 text-blue-600',
    border: 'border-blue-100 hover:border-blue-200',
    pill: 'bg-blue-50 text-blue-700',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-600',
    border: 'border-amber-100 hover:border-amber-200',
    pill: 'bg-amber-50 text-amber-700',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-600',
    border: 'border-rose-100 hover:border-rose-200',
    pill: 'bg-rose-50 text-rose-700',
    iconBg: 'bg-rose-50 text-rose-600',
  },
  purple: {
    bg: 'bg-purple-500/10 text-purple-600',
    border: 'border-purple-100 hover:border-purple-200',
    pill: 'bg-purple-50 text-purple-700',
    iconBg: 'bg-purple-50 text-purple-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10 text-cyan-600',
    border: 'border-cyan-100 hover:border-cyan-200',
    pill: 'bg-cyan-50 text-cyan-700',
    iconBg: 'bg-cyan-50 text-cyan-600',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  color = 'emerald',
  subtitle,
}) => {
  const styles = colorMap[color] || colorMap.emerald;

  return (
    <div
      className={`relative overflow-hidden bg-white/95 rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group ${styles.border}`}
    >
      {/* Subtle glossy glass light sheen reflection on top edge */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                trend >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-slate-500 truncate">
            {subtitle || trendLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
