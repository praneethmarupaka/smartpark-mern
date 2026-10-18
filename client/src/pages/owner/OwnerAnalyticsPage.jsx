import React, { useState, useEffect } from 'react';
import { ownerApi } from '../../api/owner.api.js';
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
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Car, Bike, CheckCircle2 } from 'lucide-react';

export const OwnerAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await ownerApi.getAnalytics();
        setAnalytics(res.data.data);
      } catch (err) {
        setError('Failed to load operational analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Compiling analytics..." size="lg" />
      </div>
    );
  }

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#e11d48', '#64748b'];

  const statusData = analytics?.bookingsByStatus?.map((item) => ({
    name: item._id,
    count: item.count
  })) || [];

  const vehicleData = analytics?.vehicleDistribution?.map((item) => ({
    name: item._id === 'FOUR_WHEELER' ? 'Four Wheeler (Car)' : 'Two Wheeler (Bike)',
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600" />
          Facility Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real data records tracking booking volume, vehicle breakdown and operational performance
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Booking Status Volume</h2>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No booking status data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Vehicle Type Breakdown</h2>
          <div className="h-64">
            {vehicleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label
                  >
                    {vehicleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No vehicle breakdown data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
