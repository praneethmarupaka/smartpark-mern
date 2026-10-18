import React, { useState, useEffect } from 'react';
import { ownerApi } from '../../api/owner.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { CheckSquare, Car, Bike, Clock, User, QrCode } from 'lucide-react';

export const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getBookings({ status: statusFilter || undefined });
      setBookings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch facility bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleQuickCheckIn = async (bookingRef) => {
    try {
      await ownerApi.validateQr(bookingRef);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleQuickCheckOut = async (bookingRef) => {
    try {
      await ownerApi.checkoutQr(bookingRef);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-emerald-600" />
            Facility Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Commuter reservations across your managed parking lots
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {['', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === '' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Fetching bookings..." size="md" />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No bookings recorded"
          description="There are currently no commuter reservations for your facilities."
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Reference</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Commuter</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Time Interval</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                  <td className="py-3 px-4 max-w-[150px] truncate">{b.parkingId?.name}</td>
                  <td className="py-3 px-4">{b.userId?.name || 'Commuter'}</td>
                  <td className="py-3 px-4 font-semibold">{b.vehicleNumber}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus === 'CHECKED_IN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.bookingStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleQuickCheckIn(b.bookingReference)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        Check In
                      </button>
                    )}
                    {b.bookingStatus === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleQuickCheckOut(b.bookingReference)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
