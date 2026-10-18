import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinOff, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        <MapPinOff className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The parking page or directory section you requested does not exist or has been relocated.
      </p>
      <Link
        to="/discover"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-emerald-600/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Parking Discovery
      </Link>
    </div>
  );
};
