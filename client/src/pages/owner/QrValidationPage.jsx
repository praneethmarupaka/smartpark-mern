import React, { useState } from 'react';
import { ownerApi } from '../../api/owner.api.js';
import { Alert } from '../../components/common/Alert.jsx';
import {
  QrCode,
  CheckCircle2,
  Clock,
  Car,
  Bike,
  ShieldCheck,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

export const QrValidationPage = () => {
  const [tokenOrRef, setTokenOrRef] = useState('');
  const [actionType, setActionType] = useState('checkin'); // 'checkin' or 'checkout'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!tokenOrRef.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (actionType === 'checkin') {
        res = await ownerApi.validateQr(tokenOrRef.trim());
      } else {
        res = await ownerApi.checkoutQr(tokenOrRef.trim());
      }
      setResult(res.data.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <QrCode className="w-7 h-7 text-emerald-600" />
          Operator QR Gate Validation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify digital passes and process commuter check-in and check-out
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Action Type Toggle & Input Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActionType('checkin');
              setResult(null);
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
              actionType === 'checkin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Check-In Vehicle (Arrival)
          </button>

          <button
            type="button"
            onClick={() => {
              setActionType('checkout');
              setResult(null);
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
              actionType === 'checkout'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Check-Out Vehicle (Departure)
          </button>
        </div>

        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter Booking Reference or QR Token
            </label>
            <input
              type="text"
              required
              value={tokenOrRef}
              onChange={(e) => setTokenOrRef(e.target.value)}
              placeholder="e.g. SP-20261018-ACTV or scanned token hex..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tokenOrRef.trim()}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 ${
              actionType === 'checkin'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Validating Token...' : actionType === 'checkin' ? 'Validate & Check-In' : 'Validate & Complete Departure'}
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {actionType === 'checkin' ? 'Check-In Successful' : 'Check-Out Completed'}
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {result.bookingStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Reference</span>
              <code className="font-bold text-slate-900 text-sm">{result.bookingReference}</code>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Vehicle</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                {result.vehicleType === 'TWO_WHEELER' ? <Bike className="w-4 h-4 text-emerald-600" /> : <Car className="w-4 h-4 text-emerald-600" />}
                {result.vehicleNumber}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Commuter</span>
              <span className="font-semibold text-slate-800">{result.userId?.name || 'Commuter'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Price</span>
              <span className="font-bold text-emerald-600 text-sm">
                {result.priceSnapshot?.isFree ? 'Free' : `₹${result.priceSnapshot?.totalEstimatedAmount || 0}`}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-100 text-slate-500 text-[11px] flex justify-between">
              <span>Time Slot: {new Date(result.startTime).toLocaleTimeString()} - {new Date(result.endTime).toLocaleTimeString()}</span>
              {result.checkInAt && <span>Checked In: {new Date(result.checkInAt).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
