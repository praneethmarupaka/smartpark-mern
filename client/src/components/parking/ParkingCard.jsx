import React from 'react';
import { Link } from 'react-router-dom';
import {
  VerificationBadge,
  OperationalBadge,
  CategoryBadge
} from '../common/Badge.jsx';
import {
  MapPin,
  Car,
  Bike,
  Clock,
  CalendarCheck,
  Navigation,
  Bookmark,
  AlertCircle
} from 'lucide-react';

export const ParkingCard = ({
  parking,
  isSelected = false,
  onSelect = null,
  isFavorite = false,
  onToggleFavorite = null,
  onBookClick = null
}) => {
  const [lng, lat] = parking.location?.coordinates || [null, null];
  const hasValidCoords = parking.hasCoordinates && lng !== null && lat !== null;

  // Stale availability check
  let isStale = false;
  if (parking.lastAvailabilityUpdate) {
    const hours = (Date.now() - new Date(parking.lastAvailabilityUpdate).getTime()) / (1000 * 60 * 60);
    if (hours > 4) isStale = true;
  }

  return (
    <div
      onClick={onSelect ? () => onSelect(parking) : undefined}
      className={`bg-white rounded-2xl p-5 border transition-all ${
        isSelected
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Category, Verification & Favorite */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={parking.category} />
          <VerificationBadge status={parking.verificationStatus} />
        </div>
        <div className="flex items-center gap-1.5">
          <OperationalBadge status={parking.operationalStatus} />
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(parking._id);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Locality */}
      <Link
        to={`/parking/${parking._id}`}
        className="block group"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">
          {parking.name}
        </h3>
      </Link>
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate">{parking.address}</span>
      </div>

      {/* Incomplete coordinate warning banner */}
      {!hasValidCoords && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-[11px] mb-3 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Incomplete coordinates — not positioned on map</span>
        </div>
      )}

      {/* Pricing & Availability Grid */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs mb-4 border border-slate-100">
        <div>
          <span className="text-slate-400 block text-[11px]">Pricing Model</span>
          <span className="font-bold text-slate-800 text-sm">
            {parking.pricingModel === 'FREE' ? (
              <span className="text-emerald-600">Free</span>
            ) : parking.pricing?.fourWheelerHourlyRate ? (
              `₹${parking.pricing.fourWheelerHourlyRate}/hr`
            ) : parking.pricing?.twoWheelerHourlyRate ? (
              `₹${parking.pricing.twoWheelerHourlyRate}/hr`
            ) : (
              'Unknown / Variable'
            )}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px] flex items-center gap-1">
            Reported Slots
            {isStale && <span className="text-amber-500" title="Updated > 4h ago">⚠️</span>}
          </span>
          <span className="font-bold text-slate-800 text-sm">
            {parking.availableSlots?.total !== undefined && parking.availableSlots?.total !== null ? (
              <span className={parking.availableSlots.total > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {parking.availableSlots.total} available
              </span>
            ) : (
              <span className="text-slate-400 font-normal">Unspecified</span>
            )}
          </span>
        </div>
      </div>

      {/* Vehicle Support & Public Access Restrictions */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {parking.supportedVehicleTypes?.includes('TWO_WHEELER') && (
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
              <Bike className="w-3.5 h-3.5" /> Bike
            </span>
          )}
          {parking.supportedVehicleTypes?.includes('FOUR_WHEELER') && (
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
              <Car className="w-3.5 h-3.5" /> Car
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          {parking.publicAccess === 'PUBLIC'
            ? 'Open to Public'
            : parking.publicAccess?.replace('_', ' ')}
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2">
        <Link
          to={`/parking/${parking._id}`}
          className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
        >
          View Details
        </Link>

        {parking.bookingSupported && parking.operationalStatus === 'OPEN' && (
          <button
            onClick={() => (onBookClick ? onBookClick(parking) : null)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/20"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Book
          </button>
        )}

        {hasValidCoords && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Get Directions"
          >
            <Navigation className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
