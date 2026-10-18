import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerApi } from '../../api/owner.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { VerificationBadge, OperationalBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import {
  Building2,
  PlusCircle,
  Sliders,
  Edit,
  Clock,
  Car,
  Bike,
  CheckCircle2
} from 'lucide-react';

export const MyParkingPage = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick availability modal state
  const [selectedFacilityForSlots, setSelectedFacilityForSlots] = useState(null);
  const [twoWheelerSlots, setTwoWheelerSlots] = useState(0);
  const [fourWheelerSlots, setFourWheelerSlots] = useState(0);
  const [operationalStatus, setOperationalStatus] = useState('OPEN');
  const [updating, setUpdating] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  const fetchMyParkings = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getMyParking();
      setParkings(res.data.data.parkings || []);
    } catch (err) {
      setError('Failed to fetch your facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyParkings();
  }, []);

  const openSlotModal = (facility) => {
    setSelectedFacilityForSlots(facility);
    setTwoWheelerSlots(facility.availableSlots?.twoWheeler || 0);
    setFourWheelerSlots(facility.availableSlots?.fourWheeler || 0);
    setOperationalStatus(facility.operationalStatus || 'OPEN');
    setModalSuccess(false);
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      await ownerApi.updateAvailability(selectedFacilityForSlots._id, {
        twoWheelerSlots: parseInt(twoWheelerSlots),
        fourWheelerSlots: parseInt(fourWheelerSlots),
        operationalStatus
      });
      setModalSuccess(true);
      fetchMyParkings();
      setTimeout(() => {
        setSelectedFacilityForSlots(null);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update slots');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            My Parking Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage capacity, live availability slots and facility information
          </p>
        </div>

        <Link
          to="/owner/facilities/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Facility
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Loading your facilities..." size="md" />
      ) : parkings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No facilities listed"
          description="Register your commercial, metro or private parking facility to start accepting commuter discovery and bookings."
          action={
            <Link
              to="/owner/facilities/new"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              Add Parking Facility
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parkings.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <CategoryBadge category={p.category} />
                <div className="flex items-center gap-2">
                  <OperationalBadge status={p.operationalStatus} />
                  <VerificationBadge status={p.verificationStatus} />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-slate-500 truncate">{p.address}, {p.locality}</p>
              </div>

              {/* Slots recap box */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Available / Total</span>
                  <span className="font-extrabold text-sm text-emerald-600">
                    {p.availableSlots?.total ?? 0}{' '}
                    <span className="text-slate-400 font-normal">/ {p.totalCapacity?.total || '—'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Updated</span>
                  <span className="text-slate-700 font-medium">
                    {p.lastAvailabilityUpdate
                      ? new Date(p.lastAvailabilityUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openSlotModal(p)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  Update Slots
                </button>

                <Link
                  to={`/owner/facilities/${p._id}/edit`}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors"
                  title="Edit facility details"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Availability Modal */}
      {selectedFacilityForSlots && (
        <Modal
          isOpen={!!selectedFacilityForSlots}
          onClose={() => setSelectedFacilityForSlots(null)}
          title={`Update Available Slots — ${selectedFacilityForSlots.name}`}
        >
          {modalSuccess ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Slots updated and marked as fresh!
            </div>
          ) : (
            <form onSubmit={handleUpdateAvailability} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status
                </label>
                <select
                  value={operationalStatus}
                  onChange={(e) => setOperationalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  <option value="OPEN">OPEN — Ready for commuters</option>
                  <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED — Full / Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" /> Four-Wheeler Slots
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedFacilityForSlots.totalCapacity?.fourWheeler || 9999}
                    value={fourWheelerSlots}
                    onChange={(e) => setFourWheelerSlots(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Max capacity: {selectedFacilityForSlots.totalCapacity?.fourWheeler || 'Uncapped'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5" /> Two-Wheeler Slots
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedFacilityForSlots.totalCapacity?.twoWheeler || 9999}
                    value={twoWheelerSlots}
                    onChange={(e) => setTwoWheelerSlots(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Max capacity: {selectedFacilityForSlots.totalCapacity?.twoWheeler || 'Uncapped'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacilityForSlots(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Live Slots'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
