import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { History, Shield, ArrowRight, User } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetEntity, setTargetEntity] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        targetEntity: targetEntity || undefined
      });
      setLogs(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch system audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [targetEntity]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600" />
            Immutable Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Recorded audit events tracking approvals, rejections, imports and administrative modifications
          </p>
        </div>

        <select
          value={targetEntity}
          onChange={(e) => setTargetEntity(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
        >
          <option value="">All Entities</option>
          <option value="PARKING">Parking Facilities</option>
          <option value="REPORT">User Reports</option>
          <option value="USER">User Accounts</option>
          <option value="IMPORT_JOB">Batch Imports</option>
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Retrieving audit records..." size="md" />
      ) : logs.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
          No audit records found.
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 rounded-r-xl">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-sans font-semibold">
                    {log.performedBy?.name || 'System Administrator'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-600">
                    {log.targetEntity}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                    {log.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
