import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { AlertOctagon, CheckCircle2, XCircle, Clock, User, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal resolution state
  const [activeReport, setActiveReport] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({ status: statusFilter || undefined });
      setReports(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch user reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenResolve = (report) => {
    setActiveReport(report);
    setResolveStatus('RESOLVED');
    setAdminNotes('');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!activeReport) return;

    setSubmitting(true);
    setError(null);
    try {
      await adminApi.updateReport(activeReport._id, {
        status: resolveStatus,
        adminNotes
      });
      setActiveReport(null);
      fetchReports();
    } catch (err) {
      setError('Failed to update report status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-rose-600" />
            Crowd-Sourced User Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Community discrepancy reports regarding incorrect tariffs, closed lots or inaccurate coordinates
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {['', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === '' ? 'All Reports' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Loading reports..." size="md" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No open reports"
          description="There are currently no discrepancy reports matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {r.issueType?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  Reported: {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <Link
                  to={`/parking/${r.parkingId?._id}`}
                  className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                >
                  {r.parkingId?.name || 'Parking Facility'}
                </Link>
                <div className="text-xs text-slate-500">{r.parkingId?.address}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-1">Commuter Explanation:</strong>
                <p className="leading-relaxed">{r.explanation}</p>
                <div className="text-[11px] text-slate-400 mt-2">
                  Reported by: {r.userId?.name || 'User'} ({r.userId?.email})
                </div>
              </div>

              {r.adminNotes && (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                  <strong>Resolution Notes: </strong>
                  {r.adminNotes}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-600">
                  Current Status: <span className="text-slate-900">{r.status}</span>
                </span>

                {['OPEN', 'UNDER_REVIEW'].includes(r.status) && (
                  <button
                    onClick={() => handleOpenResolve(r)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                  >
                    Take Action / Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {activeReport && (
        <Modal
          isOpen={!!activeReport}
          onClose={() => setActiveReport(null)}
          title={`Resolve Report — ${activeReport.issueType}`}
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Action Decision</label>
              <select
                value={resolveStatus}
                onChange={(e) => setResolveStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="RESOLVED">RESOLVED — Record corrected</option>
                <option value="UNDER_REVIEW">UNDER REVIEW — Flagged for inspector verification</option>
                <option value="DISMISSED">DISMISSED — Invalid or unverified claim</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Audit Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Updated hourly rates to ₹40 as reported, or verified gate signs on site..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
