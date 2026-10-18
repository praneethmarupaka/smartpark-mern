import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { VerificationBadge, OperationalBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { ParkingMap } from '../../components/map/ParkingMap.jsx';
import { BookingModal } from '../../components/booking/BookingModal.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  MapPin,
  Clock,
  Car,
  Bike,
  ShieldCheck,
  Navigation,
  Bookmark,
  AlertTriangle,
  CalendarCheck,
  Database,
  Info,
  CheckCircle2
} from 'lucide-react';

export const ParkingDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [parking, setParking] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Report form state
  const [reportType, setReportType] = useState('INCORRECT_PRICE');
  const [reportExplanation, setReportExplanation] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const fetchParking = async () => {
    setLoading(true);
    try {
      const res = await parkingApi.getById(id);
      setParking(res.data.data.parking);
      setAvailabilityStatus(res.data.data.availabilityStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parking facility details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();
  }, [id]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit a crowd report');
      return;
    }

    setReportSubmitting(true);
    try {
      await parkingApi.submitReport(id, {
        issueType: reportType,
        explanation: reportExplanation
      });
      setReportSuccess(true);
      setReportExplanation('');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner label="Loading parking facility information..." size="lg" />
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Alert type="error" message={error || 'Parking facility not found'} />
        <Link to="/discover" className="text-sm font-semibold text-emerald-600 hover:underline">
          ← Back to Discovery Map
        </Link>
      </div>
    );
  }

  const [lng, lat] = parking.location?.coordinates || [null, null];
  const hasCoords = parking.hasCoordinates && lng !== null && lat !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/discover" className="hover:text-emerald-600">Discovery</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{parking.name}</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={parking.category} />
              <VerificationBadge status={parking.verificationStatus} />
              <OperationalBadge status={parking.operationalStatus} />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {parking.name}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{parking.address}, {parking.locality}, {parking.city} - {parking.postalCode || 'Telangana'}</span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            {hasCoords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </a>
            )}

            {parking.bookingSupported && parking.operationalStatus === 'OPEN' && (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                Reserve Space
              </button>
            )}

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium transition-colors"
              title="Report incorrect details"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Report Issue
            </button>
          </div>
        </div>

        {/* Stale availability alert */}
        {availabilityStatus?.isStale && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Availability Notice:</strong> Availability was updated {availabilityStatus.hoursSinceUpdate} hours ago by facility operator and may not reflect immediate live conditions.
            </span>
          </div>
        )}

        {/* 3-Column Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Pricing Highlight */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pricing Tariff
            </span>
            <div className="text-lg font-bold text-slate-900">
              {parking.pricingModel === 'FREE' ? (
                <span className="text-emerald-600">Free Access</span>
              ) : parking.pricing?.fourWheelerHourlyRate ? (
                `₹${parking.pricing.fourWheelerHourlyRate}/hr (Car)`
              ) : (
                'Variable / Unspecified'
              )}
            </div>
            {parking.pricing?.twoWheelerHourlyRate && (
              <div className="text-xs text-slate-600">
                Bike: ₹{parking.pricing.twoWheelerHourlyRate}/hr
              </div>
            )}
            {parking.pricing?.dailyPassRate && (
              <div className="text-xs text-emerald-700 font-medium">
                Daily Pass: ₹{parking.pricing.dailyPassRate}
              </div>
            )}
          </div>

          {/* Availability Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Reported Available Slots
            </span>
            <div className="text-lg font-bold text-slate-900">
              {parking.availableSlots?.total !== undefined && parking.availableSlots?.total !== null ? (
                <span className="text-emerald-600">{parking.availableSlots.total} total spaces</span>
              ) : (
                <span className="text-slate-400 font-normal">Not Reported</span>
              )}
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-3">
              <span>Cars: {parking.availableSlots?.fourWheeler ?? '—'}</span>
              <span>Bikes: {parking.availableSlots?.twoWheeler ?? '—'}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Status: {availabilityStatus?.isOwnerReported ? 'Owner Reported' : 'Directory estimate'}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Operating Hours
            </span>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              {parking.openingHours?.is24x7
                ? '24 Hours Open'
                : `${parking.openingHours?.opensAt || '06:00'} - ${parking.openingHours?.closesAt || '22:00'}`}
            </div>
            <div className="text-xs text-slate-600">
              Access: {parking.publicAccess?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Description & Interactive Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Policies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Facility Description */}
          {parking.description && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900">About Facility</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {parking.description}
              </p>
            </div>
          )}

          {/* Access Rules & Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              Access Rules & Instructions
            </h2>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <strong>Public Access Model: </strong>
                {parking.publicAccess === 'PUBLIC'
                  ? 'Open to all general public commuters and vehicles.'
                  : parking.publicAccess === 'CUSTOMERS_ONLY'
                  ? 'Reserved strictly for customers, patrons and ticket holders of the facility.'
                  : parking.publicAccess?.replace('_', ' ')}
              </div>
              {parking.accessInstructions && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong>Entry Notes: </strong>
                  {parking.accessInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Data Provenance & Verification Audit Trail */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Directory Provenance & Verification
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Data Source</span>
                <span className="font-semibold text-slate-800">{parking.dataSource}</span>
              </div>
              {parking.sourceReference && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Reference / Gazette ID</span>
                  <span className="font-semibold text-slate-800">{parking.sourceReference}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px]">Verification Status</span>
                <span className="font-semibold text-slate-800">{parking.verificationStatus}</span>
              </div>
              {parking.verifiedAt && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Verified On</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(parking.verifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Location Map</h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {hasCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'No exact coordinates'}
              </span>
            </div>

            <div className="h-[360px] rounded-xl overflow-hidden">
              <ParkingMap
                parkings={[parking]}
                selectedParking={parking}
                height="100%"
                zoom={15}
              />
            </div>

            {hasCoords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-emerald-600" />
                Navigate to Facility
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && (
        <BookingModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          parking={parking}
          onSuccess={() => fetchParking()}
        />
      )}

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Information Issue"
      >
        {reportSuccess ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Report submitted for administrator review!
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Help keep Hyderabad parking records accurate. Reports are audited by administrators before modifications are made.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="INCORRECT_PRICE">Incorrect Price / Tariff</option>
                <option value="INCORRECT_LOCATION">Incorrect Map Coordinates</option>
                <option value="CLOSED_FACILITY">Facility Permanently Closed</option>
                <option value="INCORRECT_ACCESS_RESTRICTION">Incorrect Access Restriction</option>
                <option value="MISLEADING_AVAILABILITY">Misleading Availability</option>
                <option value="DUPLICATE_RECORD">Duplicate Record</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Explanation (min 10 characters)
              </label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={reportExplanation}
                onChange={(e) => setReportExplanation(e.target.value)}
                placeholder="Describe what is incorrect (e.g. current gate rate is ₹30/hr, or entry is restricted to hospital visitors only)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportSubmitting || reportExplanation.length < 10}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
