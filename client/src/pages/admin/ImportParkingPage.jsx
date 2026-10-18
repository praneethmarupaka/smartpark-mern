import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const ImportParkingPage = () => {
  const [csvText, setCsvText] = useState(
`name,category,facilityType,address,locality,city,latitude,longitude,twoWheelerHourlyRate,fourWheelerHourlyRate,twoWheelerCapacity,fourWheelerCapacity,bookingSupported
JBS Metro Station Ground Parking,TRANSPORT,Metro station parking,Jubilee Bus Station,Secunderabad,Hyderabad,17.4503,78.5022,15,35,200,100,true
City Centre Mall Basement,COMMERCIAL,Shopping mall parking,Road No 1,Banjara Hills,Hyderabad,17.4182,78.4485,20,50,150,220,true
Nampally Public Ground Lot,PUBLIC,Street and public parking,Station Road,Nampally,Hyderabad,17.3920,78.4710,15,30,100,40,false`
  );

  const [previewData, setPreviewData] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await adminApi.getImports();
      setImportHistory(res.data.data.jobs || []);
    } catch (err) {
      console.warn('Could not load past import jobs');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Simple CSV to JSON parser for browser
  const parseCsvToJson = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Handle simple CSV splitting (considering quoted commas)
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, index) => {
        obj[h] = values[index] !== undefined ? values[index] : '';
      });
      records.push(obj);
    }
    return records;
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setError(null);
    setCommitResult(null);

    const parsedRecords = parseCsvToJson(csvText);
    if (parsedRecords.length === 0) {
      setError('No valid CSV rows parsed. Check format.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.previewImport({
        records: parsedRecords,
        format: 'CSV'
      });
      setPreviewData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to preview CSV import');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    const parsedRecords = parseCsvToJson(csvText);
    setCommitting(true);
    setError(null);

    try {
      const res = await adminApi.commitImport({
        records: parsedRecords,
        fileName: 'directory_import_batch.csv',
        format: 'CSV',
        sourceName: 'Admin CSV Batch Import'
      });

      setCommitResult(res.data.data.job);
      setPreviewData(null);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to commit import records');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
          CSV & GeoJSON Directory Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Bulk import parking records with schema validation, duplicate detection and audit logging
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Import Policy & Verification Default</div>
          <p className="text-slate-300 leading-relaxed">
            All newly imported records default to <strong>UNVERIFIED</strong> status. They will never automatically overwrite verified records, and records without valid coordinates will not be placed on map discovery.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {commitResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Import Job Completed Successfully!
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div>Total: <strong>{commitResult.totalRecords}</strong></div>
            <div>Imported: <strong className="text-emerald-700">{commitResult.importedCount}</strong></div>
            <div>Duplicates Skipped: <strong className="text-amber-700">{commitResult.duplicateCount}</strong></div>
            <div>Invalid: <strong className="text-rose-700">{commitResult.invalidCount}</strong></div>
          </div>
        </div>
      )}

      {/* CSV Input Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Paste CSV Directory Text</h2>
          <span className="text-[11px] text-slate-400">Comma-separated format with header</span>
        </div>

        <textarea
          rows={7}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {parseCsvToJson(csvText).length} rows ready for schema validation
          </span>

          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Preview Schema & Duplicates'}
          </button>
        </div>
      </div>

      {/* Preview Table & Duplicate Summary */}
      {previewData && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import Batch Preview</h3>
              <p className="text-xs text-slate-500">
                {previewData.summary.validCount} new records • {previewData.summary.duplicateCount} duplicate warnings
              </p>
            </div>

            <button
              onClick={handleCommit}
              disabled={committing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
            >
              {committing ? 'Committing...' : 'Commit Batch to Directory'}
            </button>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Locality</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Coords Valid?</th>
                  <th className="py-2.5 px-3">Duplicate Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {previewData.samplePreview.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2 px-3">{item.locality}</td>
                    <td className="py-2 px-3">{item.category}</td>
                    <td className="py-2 px-3">
                      {item.hasCoordinates ? (
                        <span className="text-emerald-600 font-bold">Yes</span>
                      ) : (
                        <span className="text-amber-600">Missing</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {item.isPotentialDuplicate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Matches: {item.existingMatch}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          New Record
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Past Import Jobs History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          Recent Data Import Jobs
        </h3>

        {importHistory.length === 0 ? (
          <p className="text-xs text-slate-400">No batch imports recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {importHistory.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{job.fileName}</span>
                  <div className="text-[11px] text-slate-400">
                    {new Date(job.createdAt).toLocaleString()} • Executed by {job.executedBy?.name || 'Admin'}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-emerald-600">{job.importedCount} Imported</span>
                  <span className="text-amber-600">{job.duplicateCount} Duplicates</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
