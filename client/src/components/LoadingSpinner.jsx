import React from 'react';
import { Pill } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
          <Pill className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
