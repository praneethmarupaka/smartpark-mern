import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export const EditParkingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacility = async () => {
      setLoading(true);
      try {
        const res = await parkingApi.getById(id);
        const p = res.data.data.parking;
        const [lng, lat] = p.location?.coordinates || ['', ''];

        setFormData({
          name: p.name || '',
          description: p.description || '',
          category: p.category || 'COMMERCIAL',
          facilityType: p.facilityType || 'Other legitimate parking facilities',
          address: p.address || '',
          locality: p.locality || '',
          city: p.city || 'Hyderabad',
          postalCode: p.postalCode || '',
          lat: lat !== '' ? String(lat) : '',
          lng: lng !== '' ? String(lng) : '',
          twoWheelerRate: String(p.pricing?.twoWheelerHourlyRate ?? 15),
          fourWheelerRate: String(p.pricing?.fourWheelerHourlyRate ?? 35),
          pricingModel: p.pricingModel || 'PAID',
          twoWheelerCapacity: String(p.totalCapacity?.twoWheeler ?? 0),
          fourWheelerCapacity: String(p.totalCapacity?.fourWheeler ?? 0),
          bookingSupported: !!p.bookingSupported,
          publicAccess: p.publicAccess || 'PUBLIC',
          operationalStatus: p.operationalStatus || 'OPEN'
        });
      } catch (err) {
        setError('Failed to load facility');
      } finally {
        setLoading(false);
      }
    };
    fetchFacility();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
        postalCode: formData.postalCode,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        pricingModel: formData.pricingModel,
        pricing: {
          twoWheelerHourlyRate: parseFloat(formData.twoWheelerRate) || 0,
          fourWheelerHourlyRate: parseFloat(formData.fourWheelerRate) || 0
        },
        totalCapacity: {
          twoWheeler: parseInt(formData.twoWheelerCapacity) || 0,
          fourWheeler: parseInt(formData.fourWheelerCapacity) || 0
        },
        bookingSupported: formData.bookingSupported,
        publicAccess: formData.publicAccess,
        operationalStatus: formData.operationalStatus
      };

      await parkingApi.update(id, payload);
      navigate('/owner/facilities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update facility');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Loading facility details..." size="lg" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Facility Details</h1>
          <p className="text-xs text-slate-500">Update operational records and pricing</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-900 mb-0.5">Re-verification Rule</h4>
          <p className="text-amber-800 leading-relaxed">
            Note: Changes to core location coordinates, address or category will trigger a status reset to <strong>PENDING</strong> for administrator re-verification.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Status</label>
            <select
              name="operationalStatus"
              value={formData.operationalStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            >
              <option value="OPEN">OPEN</option>
              <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
              <option value="PERMANENTLY_CLOSED">PERMANENTLY CLOSED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            >
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="TRANSPORT">TRANSPORT</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
              <option value="GHMC">GHMC</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Locality</label>
            <input
              type="text"
              required
              name="locality"
              value={formData.locality}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Car Rate (₹/hr)</label>
            <input
              type="number"
              name="fourWheelerRate"
              value={formData.fourWheelerRate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bike Rate (₹/hr)</label>
            <input
              type="number"
              name="twoWheelerRate"
              value={formData.twoWheelerRate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/owner/facilities"
            className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
