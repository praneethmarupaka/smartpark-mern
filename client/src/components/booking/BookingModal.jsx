import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Alert } from '../common/Alert.jsx';
import { QrCodeDisplay } from './QrCodeDisplay.jsx';
import { bookingApi } from '../../api/booking.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Calendar, Clock, Car, Bike, ShieldCheck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingModal = ({ isOpen, onClose, parking, onSuccess = () => {} }) => {
  const { user, isAuthenticated } = useAuth();

  // Initial time default: 30 minutes from now
  const defaultStartTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);

  const [vehicleType, setVehicleType] = useState('FOUR_WHEELER');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleInfo?.vehicleNumber || '');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [durationHours, setDurationHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!parking) return null;

  // Rate calculation
  const hourlyRate =
    vehicleType === 'TWO_WHEELER'
      ? parking.pricing?.twoWheelerHourlyRate || 15
      : parking.pricing?.fourWheelerHourlyRate || 35;

  const isFree = parking.pricingModel === 'FREE';
  const totalAmount = isFree ? 0 : hourlyRate * durationHours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in or register to complete a reservation');
      return;
    }

    if (!vehicleNumber.trim()) {
      setError('Please provide a valid vehicle registration number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      const res = await bookingApi.create({
        parkingId: parking._id,
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      });

      setConfirmedBooking(res.data.data.booking);
      onSuccess(res.data.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      title={confirmedBooking ? 'Reservation Confirmed' : `Book Parking — ${parking.name}`}
      maxWidth="max-w-lg"
    >
      {confirmedBooking ? (
        <div className="space-y-4">
          <div className="text-center p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            Reservation confirmed! Capacity securely reserved.
          </div>

          <QrCodeDisplay booking={confirmedBooking} />

          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/my-bookings"
              onClick={resetForm}
              className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              Go to My Bookings
            </Link>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {/* Facility quick recap */}
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
            <div className="font-semibold text-slate-800">{parking.name}</div>
            <div className="text-slate-500">{parking.address}</div>
            <div className="text-emerald-700 font-medium">
              Rate:{' '}
              {isFree
                ? 'Free'
                : `₹${hourlyRate}/hr (${vehicleType === 'TWO_WHEELER' ? 'Bike' : 'Car'})`}
            </div>
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVehicleType('FOUR_WHEELER')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  vehicleType === 'FOUR_WHEELER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Car className="w-4 h-4" />
                Four Wheeler (Car)
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('TWO_WHEELER')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  vehicleType === 'TWO_WHEELER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bike className="w-4 h-4" />
                Two Wheeler (Bike)
              </button>
            </div>
          </div>

          {/* Vehicle Registration Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle Registration Number
            </label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g. TS09EA1234"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm uppercase tracking-wider font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Start Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Hours)
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {[1, 2, 3, 4, 6, 8, 12, 24].map((hr) => (
                  <option key={hr} value={hr}>
                    {hr} {hr === 1 ? 'Hour' : 'Hours'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Estimation Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Price</span>
              <span className="text-base font-bold text-emerald-400">
                {isFree ? 'Free Access' : `₹${totalAmount} INR`}
              </span>
            </div>
            <div className="text-right text-slate-400 text-[11px]">
              <div>{durationHours} hour reservation</div>
              <div>No advance cancellation fee</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
