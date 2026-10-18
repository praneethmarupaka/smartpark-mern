import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { VerificationBadge, OperationalBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Building2, Search, Sliders, Edit, ExternalLink, ShieldAlert } from 'lucide-react';

export const DirectoryManagementPage = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0 });

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await parkingApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: category || undefined,
        operationalStatus: undefined // Include all operational statuses
      });
      setParkings(res.data.data || []);
      if (res.data.pagination) {
        setPagination((prev) => ({ ...prev, total: res.data.pagination.total }));
      }
    } catch (err) {
      setError('Failed to fetch directory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [category, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDirectory();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'TEMPORARILY_CLOSED' : 'OPEN';
    try {
      await adminApi.updateStatus(id, {
        operationalStatus: newStatus,
        reason: 'Admin toggled operational status'
      });
      fetchDirectory();
    } catch (err) {
      setError('Failed to update operational status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-600" />
            Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform-wide directory index of Hyderabad facilities
          </p>
        </div>

        <Link
          to="/owner/facilities/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
        >
          Add New Facility
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name, address, locality..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
          />
        </form>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
        >
          <option value="">All Categories</option>
          <option value="PUBLIC">PUBLIC</option>
          <option value="TRANSPORT">TRANSPORT</option>
          <option value="GHMC">GHMC</option>
          <option value="COMMERCIAL">COMMERCIAL</option>
          <option value="GOVERNMENT">GOVERNMENT</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading directory..." size="md" />
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {parkings.map((p) => {
                const [lng, lat] = p.location?.coordinates || [null, null];
                return (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                      <Link to={`/parking/${p._id}`} className="hover:text-emerald-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="py-3 px-4">{p.locality}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {lat && lng ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : <span className="text-amber-600">Missing</span>}
                    </td>
                    <td className="py-3 px-4">
                      <VerificationBadge status={p.verificationStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(p._id, p.operationalStatus)}
                        className="cursor-pointer"
                        title="Click to toggle operational status"
                      >
                        <OperationalBadge status={p.operationalStatus} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/owner/facilities/${p._id}/edit`}
                        className="text-xs font-bold text-emerald-600 hover:underline mr-2"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
