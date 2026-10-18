import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, MapPin, ShieldCheck, AlertCircle, CheckCircle2, Database } from 'lucide-react';

export const CoverageDashboardPage = () => {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoverage = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getCoverage();
        setCoverage(res.data.data);
      } catch (err) {
        setError('Failed to fetch coverage statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchCoverage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Auditing directory coverage..." size="lg" />
      </div>
    );
  }

  const categoryChartData = coverage?.categoryCounts?.map((c) => ({
    name: c._id || 'OTHER',
    count: c.count
  })) || [];

  const localityChartData = coverage?.localityCounts?.map((l) => ({
    locality: l._id || 'Unknown',
    count: l.count
  })) || [];

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-emerald-600" />
          Hyderabad Directory Coverage Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent reporting of actual collected parking facilities and audit integrity
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Honesty Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Honest Coverage Audit Notice
        </div>
        <p className="text-slate-300 leading-relaxed">
          SmartPark reports <strong>actual indexed facilities</strong> in the Greater Hyderabad region. We do not claim complete city-wide coverage. Incomplete coordinates or missing tariff entries are surfaced below to prioritize verification audits.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Records
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {coverage?.totalRecords || 0}
          </div>
          <div className="text-xs text-slate-500">Facilities currently cataloged</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Missing Map Coords
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            {coverage?.missingCoordinatesCount || 0}
          </div>
          <div className="text-xs text-slate-500">Excluded from map markers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Missing Tariffs
          </span>
          <div className="text-2xl font-extrabold text-slate-700">
            {coverage?.missingPriceCount || 0}
          </div>
          <div className="text-xs text-slate-500">Marked as Unknown Pricing</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Missing Capacity
          </span>
          <div className="text-2xl font-extrabold text-slate-700">
            {coverage?.missingCapacityCount || 0}
          </div>
          <div className="text-xs text-slate-500">Awaiting owner capacity input</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locality Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Coverage by Locality (Top Areas)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localityChartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="locality" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Facilities by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
