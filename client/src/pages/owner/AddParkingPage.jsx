import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import { Alert } from '../../components/common/Alert.jsx';
import {
  Building2,
  MapPin,
  Car,
  Bike,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Info
} from 'lucide-react';

export const AddParkingPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'COMMERCIAL',
    facilityType: 'Shopping mall parking',
    address: '',
    locality: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '',
    lat: '17.4475',
    lng: '78.3762',
    twoWheelerRate: '20',
    fourWheelerRate: '40',
    dailyPassRate: '200',
    pricingModel: 'PAID',
    twoWheelerCapacity: '100',
    fourWheelerCapacity: '50',
    is24x7: false,
    opensAt: '06:00',
    closesAt: '22:00',
    publicAccess: 'PUBLIC',
    accessInstructions: '',
    bookingSupported: true,
    sourceEvidence: '',
    sourceReference: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        facilityType: formData.facilityType,
        address: formData.address,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        pricingModel: formData.pricingModel,
        pricing: {
          twoWheelerHourlyRate: parseFloat(formData.twoWheelerRate) || 0,
          fourWheelerHourlyRate: parseFloat(formData.fourWheelerRate) || 0,
          dailyPassRate: parseFloat(formData.dailyPassRate) || null,
          currency: 'INR'
        },
        totalCapacity: {
          twoWheeler: parseInt(formData.twoWheelerCapacity) || 0,
          fourWheeler: parseInt(formData.fourWheelerCapacity) || 0
        },
        availableSlots: {
          twoWheeler: parseInt(formData.twoWheelerCapacity) || 0,
          fourWheeler: parseInt(formData.fourWheelerCapacity) || 0
        },
        openingHours: {
          is24x7: formData.is24x7,
          opensAt: formData.opensAt,
          closesAt: formData.closesAt
        },
        publicAccess: formData.publicAccess,
        accessInstructions: formData.accessInstructions,
        bookingSupported: formData.bookingSupported,
        sourceEvidence: formData.sourceEvidence,
        sourceReference: formData.sourceReference
      };

      await parkingApi.create(payload);
      navigate('/owner/facilities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit parking facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/owner/facilities"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Register Parking Facility
          </h1>
          <p className="text-xs text-slate-500">
            Submit new parking ground, multi-level lot or complex for administrator review
          </p>
        </div>
      </div>

      {/* Admin Review Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-900 mb-0.5">Verification Policy</h4>
          <p className="text-amber-800 leading-relaxed">
            All owner submissions remain in <strong>PENDING REVIEW</strong> status until inspected by platform administrators. Once approved, the facility will be marked with a public <strong>VERIFIED</strong> badge.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Basic Facility Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-emerald-700">
            1. Facility Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Cyber Gateway Multi-Level Parking"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              >
                <option value="COMMERCIAL">COMMERCIAL — Shopping complex, retail hub</option>
                <option value="TRANSPORT">TRANSPORT — Metro / Railway / Bus terminal</option>
                <option value="PUBLIC">PUBLIC — Street / Municipal ground</option>
                <option value="PRIVATE">PRIVATE — Office campus, gated</option>
                <option value="GHMC">GHMC — Greater Hyderabad Municipal Corp</option>
                <option value="GOVERNMENT">GOVERNMENT — Official complex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Type</label>
              <select
                name="facilityType"
                value={formData.facilityType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              >
                <option value="Metro station parking">Metro station parking</option>
                <option value="Railway station parking">Railway station parking</option>
                <option value="GHMC parking grounds">GHMC parking grounds</option>
                <option value="Shopping mall parking">Shopping mall parking</option>
                <option value="Markets and commercial complexes">Markets and commercial complexes</option>
                <option value="Multilevel parking facilities">Multilevel parking facilities</option>
                <option value="Other legitimate parking facilities">Other legitimate parking facilities</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide directions, entry landmarks, and covered vs open lot notes..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-emerald-700">
            2. Address & WGS-84 Coordinates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot 12, Cyber Towers Main Road"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Locality *</label>
              <input
                type="text"
                required
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="e.g. Madhapur, Abids, Secunderabad"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="500081"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="17.4475"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                placeholder="78.3762"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-emerald-700">
            3. Tariffs & Total Capacity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tariff Model</label>
              <select
                name="pricingModel"
                value={formData.pricingModel}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              >
                <option value="PAID">PAID — Hourly Tariff</option>
                <option value="FREE">FREE — Complimentary</option>
                <option value="VARIABLE">VARIABLE — Event/Dynamic Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Car Rate (₹/hr)</label>
              <input
                type="number"
                name="fourWheelerRate"
                value={formData.fourWheelerRate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bike Rate (₹/hr)</label>
              <input
                type="number"
                name="twoWheelerRate"
                value={formData.twoWheelerRate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Four-Wheeler Capacity</label>
              <input
                type="number"
                name="fourWheelerCapacity"
                value={formData.fourWheelerCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Two-Wheeler Capacity</label>
              <input
                type="number"
                name="twoWheelerCapacity"
                value={formData.twoWheelerCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="bookingSupported"
                  checked={formData.bookingSupported}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Support Online Bookings</span>
              </label>
            </div>
          </div>
        </div>

        {/* Source Evidence */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-emerald-700">
            4. Supporting Source Evidence
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorization / Ticket Reference ID
              </label>
              <input
                type="text"
                name="sourceReference"
                value={formData.sourceReference}
                onChange={handleChange}
                placeholder="e.g. GHMC-TICKET-2026-99"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Access Category
              </label>
              <select
                name="publicAccess"
                value={formData.publicAccess}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              >
                <option value="PUBLIC">PUBLIC — Open to all</option>
                <option value="CUSTOMERS_ONLY">CUSTOMERS ONLY</option>
                <option value="STAFF_ONLY">STAFF ONLY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/owner/facilities"
            className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Submitting Facility...' : 'Submit for Admin Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};
