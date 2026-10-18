import React from 'react';
import { Search, Filter, Compass, CheckCircle2, RotateCcw } from 'lucide-react';

export const ParkingFilters = ({
  filters,
  onChange,
  onReset,
  onUseLocation,
  locationLoading = false
}) => {
  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Public Parking', value: 'PUBLIC' },
    { label: 'Metro & Railway (Transport)', value: 'TRANSPORT' },
    { label: 'GHMC Facilities', value: 'GHMC' },
    { label: 'Commercial Malls & Hubs', value: 'COMMERCIAL' },
    { label: 'Government', value: 'GOVERNMENT' },
    { label: 'Private / Office', value: 'PRIVATE' },
    { label: 'Other', value: 'OTHER' }
  ];

  const vehicleTypes = [
    { label: 'All Vehicles', value: '' },
    { label: 'Two Wheeler (Bikes)', value: 'TWO_WHEELER' },
    { label: 'Four Wheeler (Cars)', value: 'FOUR_WHEELER' }
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'createdAt' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Availability Freshness', value: 'freshness' },
    { label: 'Alphabetical Name', value: 'name' }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search by facility name, locality (e.g. Madhapur, Abids)..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Filter Row 1: Category, Vehicle, Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Type</label>
          <select
            value={filters.vehicleType || ''}
            onChange={(e) => onChange('vehicleType', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {vehicleTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Results</label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle Checkboxes & Geospatial Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.verifiedOnly === 'true' || filters.verifiedOnly === true}
              onChange={(e) => onChange('verifiedOnly', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Only
            </span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.bookingSupported === 'true' || filters.bookingSupported === true}
              onChange={(e) => onChange('bookingSupported', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Online Booking Supported</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {onUseLocation && (
            <button
              onClick={onUseLocation}
              disabled={locationLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <Compass className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
              {locationLoading ? 'Detecting...' : 'Nearby GPS'}
            </button>
          )}

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
