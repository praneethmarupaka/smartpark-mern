import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerApi } from '../../api/owner.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { VerificationBadge, OperationalBadge } from '../../components/common/Badge.jsx';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  IndianRupee,
  PlusCircle,
  QrCode,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export const OwnerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getDashboard();
      setDashboardData(res.data.data);
    } catch (err) {
      setError('Failed to load owner dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Loading facility operations..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time management for authorized parking operators
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/validate-qr"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Scan QR Code
          </Link>
          <Link
            to="/owner/facilities/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Facility
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            My Facilities
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {dashboardData?.totalFacilities || 0}
          </div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {dashboardData?.verifiedFacilities || 0} Verified by Admin
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Active Bookings
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {dashboardData?.activeBookings || 0}
          </div>
          <div className="text-xs text-slate-500">
            Confirmed & checked-in commuters
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Completed Visits
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {dashboardData?.completedBookings || 0}
          </div>
          <div className="text-xs text-slate-500">
            Successfully checked-out bookings
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Real Revenue
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 flex items-center">
            ₹{dashboardData?.totalRealRevenue || 0}
          </div>
          <div className="text-xs text-slate-400 font-normal">
            Calculated from completed bookings
          </div>
        </div>
      </div>

      {/* Facilities Overview Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Your Registered Parking Facilities
          </h2>
          <Link
            to="/owner/facilities"
            className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
          >
            View All ({dashboardData?.totalFacilities || 0})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dashboardData?.facilities?.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No facilities registered yet. Submit your first parking facility for admin review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Facility Name</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Available Slots</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dashboardData?.facilities?.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.name}</td>
                    <td className="py-3 px-4">{f.locality}</td>
                    <td className="py-3 px-4">
                      <OperationalBadge status={f.operationalStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <VerificationBadge status={f.verificationStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-600">
                        {f.availableSlots?.total ?? '—'}
                      </span>
                      <span className="text-slate-400"> / {f.totalCapacity?.total ?? '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/owner/facilities/${f._id}/edit`}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
