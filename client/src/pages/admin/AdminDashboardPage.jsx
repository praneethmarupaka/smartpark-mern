import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import {
  ShieldCheck,
  Building2,
  Clock,
  AlertOctagon,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  BarChart3,
  ArrowRight,
  HelpCircle,
  XCircle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getDashboard();
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load administrator statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Loading admin governance portal..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-amber-600" />
            Administrator Governance Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform-wide directory integrity, verification queue and audit records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Clock className="w-4 h-4" />
            Verification Queue ({stats?.pendingParkings || 0})
          </Link>
          <Link
            to="/admin/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Import Directory CSV
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Directory Records
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats?.totalParkings || 0}
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {stats?.verifiedParkings || 0} Verified by Admin
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Pending Submissions
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            {stats?.pendingParkings || 0}
          </div>
          <Link to="/admin/verification" className="text-xs text-amber-700 hover:underline font-medium">
            Requires audit & review →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Unverified Imports
          </span>
          <div className="text-2xl font-extrabold text-slate-700">
            {stats?.unverifiedParkings || 0}
          </div>
          <div className="text-xs text-slate-400">
            Awaiting source validation
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Open User Reports
          </span>
          <div className="text-2xl font-extrabold text-rose-600">
            {stats?.openReports || 0}
          </div>
          <Link to="/admin/reports" className="text-xs text-rose-700 hover:underline font-medium">
            Review community flags →
          </Link>
        </div>
      </div>

      {/* Secondary Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/verification"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
            Verification Queue
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Inspect pending owner submissions, review evidence, approve or request corrections with audit tracking.
          </p>
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
            Open Queue <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          to="/admin/coverage"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
            Hyderabad Coverage Metrics
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Inspect verified coverage by category, locality breakdown, and facilities missing coordinates or prices.
          </p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            View Metrics <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
            System Audit Trail
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Immutable log of all verification approvals, rejections, status changes and imports executed on the platform.
          </p>
          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            Inspect Logs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
};
