import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export const VerificationBadge = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          VERIFIED
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          PENDING REVIEW
        </span>
      );
    case 'NEEDS_CORRECTION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          NEEDS CORRECTION
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          REJECTED
        </span>
      );
    case 'UNVERIFIED':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          UNVERIFIED
        </span>
      );
  }
};

export const OperationalBadge = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          OPEN
        </span>
      );
    case 'TEMPORARILY_CLOSED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          TEMPORARILY CLOSED
        </span>
      );
    case 'PERMANENTLY_CLOSED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          CLOSED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
          UNKNOWN STATUS
        </span>
      );
  }
};

export const CategoryBadge = ({ category }) => {
  const styles = {
    PUBLIC: 'bg-blue-50 text-blue-700 border-blue-200',
    GHMC: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    TRANSPORT: 'bg-purple-50 text-purple-700 border-purple-200',
    COMMERCIAL: 'bg-teal-50 text-teal-700 border-teal-200',
    GOVERNMENT: 'bg-orange-50 text-orange-700 border-orange-200',
    PRIVATE: 'bg-slate-100 text-slate-700 border-slate-200',
    OTHER: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
        styles[category] || styles.OTHER
      }`}
    >
      {category}
    </span>
  );
};
