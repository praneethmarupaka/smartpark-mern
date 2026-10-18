import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { QrCodeDisplay } from '../../components/booking/QrCodeDisplay.jsx';
import {
  CalendarCheck,
  QrCode,
  XCircle,
  MapPin,
  Clock,
  Car,
  Bike,
  Compass,
  ArrowRight
} from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBookingForQr, setSelectedBookingForQr] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings({
        status: statusFilter || undefined
      });
      setBookings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will be released back to the directory.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingApi.cancel(bookingId, 'User requested cancellation');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CHECKED_IN: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
      EXPIRED: 'bg-zinc-100 text-zinc-700 border-zinc-200'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badges[status] || badges.COMPLETED}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-emerald-600" />
            My Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View booking passes, QR tokens and reservation history
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs font-semibold">
          {['', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === '' ? 'All Bookings' : st}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Fetching your reservations..." size="md" />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations found"
          description={
            statusFilter
              ? `No ${statusFilter.toLowerCase()} bookings found. Try viewing all bookings.`
              : 'You have not reserved parking slots yet.'
          }
          action={
            <Link
              to="/discover"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Find & Book Parking
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {b.bookingReference}
                  </code>
                  {getStatusBadge(b.bookingStatus)}
                </div>

                <Link
                  to={`/parking/${b.parkingId?._id}`}
                  className="block text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                >
                  {b.parkingId?.name || 'Parking Facility'}
                </Link>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.parkingId?.address || 'Hyderabad'}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    {b.vehicleType === 'TWO_WHEELER' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                    <span className="font-semibold">{b.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(b.startTime)} — {formatDate(b.endTime)}</span>
                  </div>
                </div>
              </div>

              {/* Right Price & Actions */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Tariff</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {b.priceSnapshot?.isFree ? 'Free' : `₹${b.priceSnapshot?.totalEstimatedAmount || 0}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBookingForQr(b)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    View QR Pass
                  </button>

                  {['CONFIRMED', 'PENDING'].includes(b.bookingStatus) && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancellingId === b._id}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedBookingForQr && (
        <Modal
          isOpen={!!selectedBookingForQr}
          onClose={() => setSelectedBookingForQr(null)}
          title={`Booking Pass — ${selectedBookingForQr.bookingReference}`}
          maxWidth="max-w-md"
        >
          <QrCodeDisplay booking={selectedBookingForQr} />
        </Modal>
      )}
    </div>
  );
};
