import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { VerificationBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  FileText,
  User,
  Car,
  Bike
} from 'lucide-react';

export const VerificationQueuePage = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Modal action states
  const [activeFacility, setActiveFacility] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE', 'REJECT', 'CORRECTION'
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPending({ status: statusFilter });
      setParkings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleOpenActionModal = (facility, type) => {
    setActiveFacility(facility);
    setActionType(type);
    setActionNotes('');
  };

  const handleExecuteVerification = async (e) => {
    e.preventDefault();
    if (!activeFacility || !actionType) return;

    if (actionType !== 'APPROVE' && !actionNotes.trim()) {
      setError('A clear reason is required when rejecting or requesting corrections');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const targetStatus =
        actionType === 'APPROVE'
          ? 'VERIFIED'
          : actionType === 'REJECT'
          ? 'REJECTED'
          : 'NEEDS_CORRECTION';

      await adminApi.updateVerification(activeFacility._id, {
        status: targetStatus,
        notes: actionNotes.trim(),
        rejectionReason: actionType === 'REJECT' ? actionNotes.trim() : ''
      });

      setActiveFacility(null);
      setActionType(null);
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-amber-600" />
            Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect evidence, audit coordinates and issue verified status
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          {['PENDING', 'UNVERIFIED', 'NEEDS_CORRECTION', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Loading verification queue..." size="md" />
      ) : parkings.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={`No ${statusFilter.toLowerCase().replace('_', ' ')} records`}
          description="The queue is currently clear for this status category."
        />
      ) : (
        <div className="space-y-4">
          {parkings.map((p) => {
            const [lng, lat] = p.location?.coordinates || [null, null];
            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={p.category} />
                    <VerificationBadge status={p.verificationStatus} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Submitted: {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.address}, {p.locality} (Telangana)</span>
                  </div>
                </div>

                {/* Evidence & Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Source Reference</span>
                    <span className="font-semibold text-slate-800">{p.sourceReference || 'None supplied'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Coordinates</span>
                    <span className="font-mono text-slate-700">
                      {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Missing coordinates'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Submitted By</span>
                    <span className="text-slate-800 font-medium">
                      {p.createdBy?.name || 'Data Import'} ({p.createdBy?.role || 'SYSTEM'})
                    </span>
                  </div>
                </div>

                {p.verificationNotes && (
                  <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                    <strong>Previous Admin Notes: </strong>
                    {p.verificationNotes}
                  </div>
                )}

                {/* Verification Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  <button
                    onClick={() => handleOpenActionModal(p, 'APPROVE')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Verify
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(p, 'CORRECTION')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Request Corrections
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(p, 'REJECT')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Reject Listing
                  </button>

                  {lat && lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs ml-auto"
                    >
                      Inspect Map <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {activeFacility && (
        <Modal
          isOpen={!!activeFacility}
          onClose={() => setActiveFacility(null)}
          title={`Confirm Decision — ${activeFacility.name}`}
        >
          <form onSubmit={handleExecuteVerification} className="space-y-4">
            <p className="text-xs text-slate-600">
              You are about to mark this facility as{' '}
              <strong className="text-slate-900">
                {actionType === 'APPROVE'
                  ? 'VERIFIED'
                  : actionType === 'REJECT'
                  ? 'REJECTED'
                  : 'NEEDS CORRECTION'}
              </strong>
              . This event will be recorded in the immutable audit log.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {actionType === 'APPROVE' ? 'Audit Notes (Optional)' : 'Mandatory Reason / Correction Request *'}
              </label>
              <textarea
                required={actionType !== 'APPROVE'}
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'e.g. Physical site inspected, GHMC commercial trade license verified.'
                    : 'Detail why this record was rejected or what coordinates/details need correction...'
                }
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFacility(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing || (actionType !== 'APPROVE' && !actionNotes.trim())}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors disabled:opacity-50 ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
