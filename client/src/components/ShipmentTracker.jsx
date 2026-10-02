import React from 'react';
import {
  ClipboardCheck,
  Package,
  Truck,
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  Thermometer,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed', icon: ClipboardCheck },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Dispatched', icon: Truck },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Navigation },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const getStageIndex = (status) => {
  const index = STAGES.findIndex((s) => s.key === status);
  return index !== -1 ? index : 0;
};

const ShipmentTracker = ({ shipment }) => {
  if (!shipment) return null;

  const currentIdx = getStageIndex(shipment.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900">
              {shipment.shipmentId}
            </h4>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Tracking #: <span className="font-semibold text-slate-700">{shipment.trackingNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>Temp: <strong className="font-medium">{shipment.temperatureReading || '4.0°C (Normal)'}</strong></span>
          </div>

          <div className="text-right">
            <p className="text-slate-400">Carrier</p>
            <p className="font-medium text-slate-700">{shipment.carrier || 'MedEx Direct'}</p>
          </div>
        </div>
      </div>

      {/* 6-Stage Progress Stepper */}
      <div className="py-2">
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${(currentIdx / (STAGES.length - 1)) * 100}%`,
            }}
          />

          {/* Stepper Nodes */}
          <div className="relative z-10 flex justify-between">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPassed = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              let nodeClasses = 'bg-white border-2 border-slate-200 text-slate-400';
              if (isPassed) {
                nodeClasses = 'bg-emerald-600 border-emerald-600 text-white shadow-sm';
              } else if (isCurrent) {
                nodeClasses =
                  'bg-white border-2 border-emerald-600 text-emerald-600 ring-4 ring-emerald-50 shadow-md';
              }

              return (
                <div key={stage.key} className="flex flex-col items-center group">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${nodeClasses}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center hidden md:block max-w-[80px] leading-tight ${
                      isCurrent
                        ? 'text-emerald-700 font-bold'
                        : isPassed
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Origin, Destination & Current Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Origin</span>
          <p className="font-semibold text-slate-800 mt-0.5">
            {shipment.originWarehouse?.name || 'Central Logistics Hub'}
          </p>
          <p className="text-slate-500 truncate">
            {shipment.originWarehouse?.location?.city
              ? `${shipment.originWarehouse.location.city}, ${shipment.originWarehouse.location.state}`
              : 'Warehouse Depot'}
          </p>
        </div>

        <div>
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Current Telemetry</span>
          <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            {shipment.currentLocation || 'In Transit'}
          </p>
          <p className="text-slate-500">
            Est. Arrival: {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'Pending'}
          </p>
        </div>

        <div>
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Destination</span>
          <p className="font-semibold text-slate-800 mt-0.5 truncate">
            {shipment.destination || 'Metro General Hospital Pharmacy'}
          </p>
          <p className="text-slate-500">
            Order Ref: #{shipment.order?.orderId || 'Direct'}
          </p>
        </div>
      </div>

      {/* Chronological Timeline Checkpoints */}
      {shipment.timeline && shipment.timeline.length > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Transit Checkpoint History
          </h5>
          <div className="space-y-3 pl-2 border-l-2 border-slate-100 ml-2">
            {[...shipment.timeline].reverse().map((checkpoint, idx) => (
              <div key={idx} className="relative pl-4">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {checkpoint.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">
                      {new Date(checkpoint.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {checkpoint.location && (
                    <p className="text-slate-600 font-medium mt-0.5">
                      {checkpoint.location}
                    </p>
                  )}
                  {checkpoint.note && (
                    <p className="text-slate-500 italic mt-0.5">
                      "{checkpoint.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracker;
