import React from 'react';
import { Link } from 'react-router-dom';
import { VerificationBadge, CategoryBadge } from '../common/Badge.jsx';
import { Sparkles, MapPin, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export const RecommendationCard = ({ recommendation, onSelect = null }) => {
  const { facility, score, distanceKm, reasons = [] } = recommendation;

  return (
    <div
      onClick={onSelect ? () => onSelect(facility) : undefined}
      className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm hover:shadow transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
        <Sparkles className="w-3 h-3 text-amber-300" />
        Score {score}/100
      </div>

      <div className="flex items-center gap-1.5 mb-2 pr-24 flex-wrap">
        <CategoryBadge category={facility.category} />
        <VerificationBadge status={facility.verificationStatus} />
      </div>

      <h4 className="font-bold text-slate-900 text-sm mb-1 hover:text-emerald-600 transition-colors">
        <Link to={`/parking/${facility._id}`}>{facility.name}</Link>
      </h4>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {facility.locality}
        </span>
        {distanceKm !== null && (
          <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
            {distanceKm} km away
          </span>
        )}
      </div>

      {/* Transparent Reasons */}
      {reasons.length > 0 && (
        <div className="space-y-1 mb-3 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Why Recommended:
          </span>
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Tariff</span>
          <span className="font-bold text-slate-900">
            {facility.pricingModel === 'FREE'
              ? 'Free'
              : facility.pricing?.fourWheelerHourlyRate
              ? `₹${facility.pricing.fourWheelerHourlyRate}/hr`
              : 'Standard'}
          </span>
        </div>

        <Link
          to={`/parking/${facility._id}`}
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          View Facility
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
