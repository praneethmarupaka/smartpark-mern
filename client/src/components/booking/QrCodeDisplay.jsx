import React from 'react';
import { Calendar, Clock, MapPin, ShieldCheck, Car, Bike } from 'lucide-react';

export const QrCodeDisplay = ({ booking }) => {
  if (!booking) return null;

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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center max-w-sm mx-auto shadow-sm">
      <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-4">
        {booking.bookingStatus} PASS
      </div>

      {/* QR Code Container */}
      <div className="w-56 h-56 mx-auto bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 mb-4 flex items-center justify-center">
        {booking.qrDataUrl ? (
          <img
            src={booking.qrDataUrl}
            alt={`QR Code for ${booking.bookingReference}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-xs text-slate-400">QR code unavailable</div>
        )}
      </div>

      {/* Booking Reference */}
      <div className="mb-4">
        <span className="text-slate-400 text-xs block mb-0.5">Booking Reference</span>
        <code className="text-base font-bold text-slate-900 tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
          {booking.bookingReference}
        </code>
      </div>

      {/* Details Box */}
      <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Vehicle:</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            {booking.vehicleType === 'TWO_WHEELER' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
            {booking.vehicleNumber}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Start Time:</span>
          <span className="font-medium text-slate-800">{formatDate(booking.startTime)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">End Time:</span>
          <span className="font-medium text-slate-800">{formatDate(booking.endTime)}</span>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
          <span className="text-slate-700">Estimated Total:</span>
          <span className="text-emerald-600 text-sm">
            {booking.priceSnapshot?.isFree ? 'Free' : `₹${booking.priceSnapshot?.totalEstimatedAmount || 0}`}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 leading-normal">
        Present this QR code or booking reference at entry boom barrier for operator scanning.
      </p>
    </div>
  );
};
