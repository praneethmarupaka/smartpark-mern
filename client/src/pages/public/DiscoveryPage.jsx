import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ParkingMap } from '../../components/map/ParkingMap.jsx';
import { ParkingCard } from '../../components/parking/ParkingCard.jsx';
import { ParkingFilters } from '../../components/parking/ParkingFilters.jsx';
import { RecommendationCard } from '../../components/parking/RecommendationCard.jsx';
import { BookingModal } from '../../components/booking/BookingModal.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import {
  Map as MapIcon,
  List as ListIcon,
  Columns,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';

export const DiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { coords: geoCoords, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // Search & Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    vehicleType: searchParams.get('vehicleType') || '',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    bookingSupported: searchParams.get('bookingSupported') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    radiusKm: 5
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  // View state
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'list'
  const [parkings, setParkings] = useState([]);
  const [nearbyRecommendations, setNearbyRecommendations] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [bookingParking, setBookingParking] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Fetch directory list
  const fetchParkings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        category: filters.category || undefined,
        vehicleType: filters.vehicleType || undefined,
        verifiedOnly: filters.verifiedOnly ? 'true' : undefined,
        bookingSupported: filters.bookingSupported ? 'true' : undefined,
        sortBy: filters.sortBy
      };

      const res = await parkingApi.getAll(params);
      setParkings(res.data.data || []);
      if (res.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total
        }));
      }
    } catch (err) {
      setError('Unable to load parking directory. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby recommendations when GPS coordinates are available
  const fetchNearby = async (lat, lng) => {
    try {
      const res = await parkingApi.getNearby({
        lat,
        lng,
        radiusKm: filters.radiusKm,
        category: filters.category || undefined,
        vehicleType: filters.vehicleType || 'FOUR_WHEELER',
        verifiedOnly: filters.verifiedOnly ? 'true' : undefined,
        bookingSupported: filters.bookingSupported ? 'true' : undefined
      });
      setNearbyRecommendations(res.data.data.results || []);
    } catch (err) {
      console.warn('Failed to fetch nearby recommendations:', err.message);
    }
  };

  // Fetch favorites if user is authenticated
  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await parkingApi.getFavorites();
      setFavorites(res.data.data.favorites?.map((f) => f._id) || []);
    } catch (err) {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchParkings();
  }, [debouncedSearch, filters.category, filters.vehicleType, filters.verifiedOnly, filters.bookingSupported, filters.sortBy, pagination.page]);

  useEffect(() => {
    if (geoCoords) {
      fetchNearby(geoCoords.lat, geoCoords.lng);
    }
  }, [geoCoords, filters.radiusKm, filters.category, filters.vehicleType]);

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      vehicleType: '',
      verifiedOnly: false,
      bookingSupported: false,
      sortBy: 'createdAt',
      radiusKm: 5
    });
    setNearbyRecommendations([]);
    setSearchParams({});
  };

  const handleToggleFavorite = async (parkingId) => {
    if (!isAuthenticated) {
      setError('Please sign in to save favorite facilities.');
      return;
    }
    try {
      const res = await parkingApi.toggleFavorite(parkingId);
      if (res.data.data.isFavorited) {
        setFavorites((prev) => [...prev, parkingId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== parkingId));
      }
    } catch (err) {
      setError('Could not update favorite');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hyderabad Parking Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Showing {parkings.length} of {pagination.total} facilities • Real-time verified directory
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map Only</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListIcon className="w-4 h-4" />
            <span>List Only</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ParkingFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        onUseLocation={requestLocation}
        locationLoading={geoLoading}
      />

      {/* Geolocation feedback or errors */}
      {geoError && <Alert type="warning" message={geoError} onClose={() => {}} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Smart Recommendations Carousel / Strip when GPS is active */}
      {nearbyRecommendations.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Transparent Smart Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Scored based on proximity to your GPS, tariff affordability, and verification status.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {nearbyRecommendations.length} Recommendations Found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyRecommendations.slice(0, 3).map((rec) => (
              <RecommendationCard
                key={rec.facility._id}
                recommendation={rec}
                onSelect={(f) => setSelectedParking(f)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout (Map + List / Map / List) */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split'
            ? 'grid-cols-1 lg:grid-cols-12'
            : viewMode === 'map'
            ? 'grid-cols-1'
            : 'grid-cols-1'
        }`}
      >
        {/* Map Panel */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={viewMode === 'split' ? 'lg:col-span-7 h-[650px] sticky top-20' : 'h-[700px]'}>
            <ParkingMap
              parkings={parkings}
              selectedParking={selectedParking}
              onSelectParking={(p) => setSelectedParking(p)}
              userCoords={geoCoords}
              height="100%"
            />
          </div>
        )}

        {/* List Panel */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className={viewMode === 'split' ? 'lg:col-span-5 space-y-4' : 'space-y-4'}>
            {loading ? (
              <LoadingSpinner label="Fetching verified facilities..." size="md" />
            ) : parkings.length === 0 ? (
              <EmptyState
                title="No parking locations match criteria"
                description="Try clearing some of your filters or expanding your search query."
                action={
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Reset All Filters
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {parkings.map((parking) => (
                  <ParkingCard
                    key={parking._id}
                    parking={parking}
                    isSelected={selectedParking?._id === parking._id}
                    onSelect={(p) => setSelectedParking(p)}
                    isFavorite={favorites.includes(parking._id)}
                    onToggleFavorite={handleToggleFavorite}
                    onBookClick={(p) => setBookingParking(p)}
                  />
                ))}

                {/* Pagination Controls */}
                {pagination.total > pagination.limit && (
                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600">
                    <span>
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                      >
                        Previous
                      </button>
                      <button
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingParking && (
        <BookingModal
          isOpen={!!bookingParking}
          onClose={() => setBookingParking(null)}
          parking={bookingParking}
          onSuccess={() => {
            fetchParkings();
          }}
        />
      )}
    </div>
  );
};
