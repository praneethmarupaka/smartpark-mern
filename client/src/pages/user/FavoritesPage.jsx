import React, { useState, useEffect } from 'react';
import { parkingApi } from '../../api/parking.api.js';
import { ParkingCard } from '../../components/parking/ParkingCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { BookingModal } from '../../components/booking/BookingModal.jsx';
import { Bookmark, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingParking, setBookingParking] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await parkingApi.getFavorites();
      setFavorites(res.data.data.favorites || []);
    } catch (err) {
      setError('Failed to fetch your saved parking facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (parkingId) => {
    try {
      await parkingApi.toggleFavorite(parkingId);
      setFavorites((prev) => prev.filter((p) => p._id !== parkingId));
    } catch (err) {
      setError('Could not update favorite');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-emerald-600 fill-emerald-600" />
          Saved Favorites
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quick access to your regularly visited parking locations in Hyderabad
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Loading saved facilities..." size="md" />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No favorites saved yet"
          description="Bookmark parking locations in the discovery portal for quick 1-click access."
          action={
            <Link
              to="/discover"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Discover Parking Facilities
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((parking) => (
            <ParkingCard
              key={parking._id}
              parking={parking}
              isFavorite={true}
              onToggleFavorite={handleRemoveFavorite}
              onBookClick={(p) => setBookingParking(p)}
            />
          ))}
        </div>
      )}

      {bookingParking && (
        <BookingModal
          isOpen={!!bookingParking}
          onClose={() => setBookingParking(null)}
          parking={bookingParking}
        />
      )}
    </div>
  );
};
