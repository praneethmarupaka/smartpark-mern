import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname;

  // Auto-fill from query param if provided (e.g. /login?role=admin)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setEmail('admin@smartpark.hyderabad.gov');
      setPassword('AdminSecurePass#2026');
    } else if (roleParam === 'owner') {
      setEmail('owner@hyderabadmetro.org');
      setPassword('OwnerPass#2026');
    } else if (roleParam === 'user') {
      setEmail('commuter@gmail.com');
      setPassword('UserPass#2026');
    }
  }, [searchParams]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/discover', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedInUser.role === 'OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/discover', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-extrabold text-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <Car className="w-6 h-6" />
          </div>
          <span>SmartPark</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500">
          Enter credentials or choose a 1-click test persona below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commuter@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              1-Click Demo Personas
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('commuter@gmail.com', 'UserPass#2026')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-[11px] font-bold text-slate-800">Commuter</div>
                <div className="text-[10px] text-slate-500">Driver</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner@hyderabadmetro.org', 'OwnerPass#2026')}
                className="p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200 text-left transition-colors"
              >
                <Building2 className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-[11px] font-bold text-indigo-900">Owner</div>
                <div className="text-[10px] text-indigo-600">Operator</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartpark.hyderabad.gov', 'AdminSecurePass#2026')}
                className="p-2 rounded-xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200 text-left transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 mb-1" />
                <div className="text-[11px] font-bold text-amber-900">Admin</div>
                <div className="text-[10px] text-amber-700">Governance</div>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
