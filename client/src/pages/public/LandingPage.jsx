import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parkingApi } from '../../api/parking.api.js';
import {
  Car,
  Compass,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Train,
  Building,
  ShoppingBag,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 10,
    verified: 7,
    metroCount: 3
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const res = await parkingApi.getAll({ limit: 1 });
        if (res.data.pagination) {
          setStats((prev) => ({
            ...prev,
            total: res.data.pagination.total
          }));
        }
      } catch (err) {
        // Fallback to local default
      }
    };
    fetchQuickStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const categories = [
    {
      title: 'Metro & Railway Parking',
      description: 'Hitec City, Secunderabad, Begumpet stations with multimodal parking bays.',
      icon: Train,
      category: 'TRANSPORT',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'GHMC Public Grounds',
      description: 'Municipal multi-level automated facilities in Abids, Charminar & markets.',
      icon: Building,
      category: 'GHMC',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Commercial Complexes',
      description: 'Inorbit Mall, Forum Sujana, and major tech corridor shopping plazas.',
      icon: ShoppingBag,
      category: 'COMMERCIAL',
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    }
  ];

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Verification Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verifiable Hyderabad Parking Directory</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{stats.total}+ Facilities Indexed</span>
        </div>

        {/* Main Heading */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Discover & Book Commuter Parking Across <span className="text-emerald-600">Hyderabad</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Find verified parking near metro stations, GHMC complexes, tech hubs and markets. Compare rates, check owner-reported availability, and reserve slots with QR check-in.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20"
          >
            <div className="flex-1 flex items-center gap-3 pl-3">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area (e.g. Hitec City, Abids, Secunderabad)..."
                className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm shadow-emerald-600/20 flex-shrink-0"
            >
              <Compass className="w-4 h-4" />
              Find Parking
            </button>
          </form>

          {/* Quick Locality Tags */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap text-xs text-slate-500">
            <span>Popular:</span>
            {['Hitec City', 'Secunderabad', 'Abids', 'Madhapur', 'Charminar', 'Jubilee Hills'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => navigate(`/discover?search=${encodeURIComponent(loc)}`)}
                className="hover:text-emerald-600 underline underline-offset-2 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Structured Parking Directory
          </h2>
          <p className="text-sm text-slate-500">
            Browse by municipal classification, transit hubs, and commercial complexes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                to={`/discover?category=${cat.category}`}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  Explore facilities
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Real Features Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Core System Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Designed for Reliability & Full-Stack Rigor
              </h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">2dsphere Geospatial Search</strong>
                    Native MongoDB geospatial indexing with transparent recommendation scoring by distance, rate and verification.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">Owner-Reported Availability & Stale Alerts</strong>
                    Clear distinction between directory records, verified operational states, and freshness warnings if updates exceed 4 hours.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">Time-Interval Reservation Concurrency</strong>
                    Overlapping booking validation prevents overselling beyond actual capacity limits.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/discover"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-md shadow-emerald-500/20"
                >
                  Explore Hyderabad Map
                </Link>
                <Link
                  to="/how-it-works"
                  className="text-slate-300 hover:text-white font-semibold text-sm px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  View Architecture Docs
                </Link>
              </div>
            </div>

            {/* Live Demo Quick-Login card */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Portfolio Role Switcher
                  </span>
                </div>
                <span className="text-xs text-slate-400">1-Click Test Access</span>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login?role=admin"
                  className="block p-3 rounded-xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-amber-400">Administrator Portal</div>
                      <div className="text-xs text-slate-400">Review pending verifications, audit logs & CSV import</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  to="/login?role=owner"
                  className="block p-3 rounded-xl bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-indigo-400">Facility Owner Dashboard</div>
                      <div className="text-xs text-slate-400">Manage slots, validate QR codes & view real revenue</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  to="/login?role=user"
                  className="block p-3 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-emerald-400">Commuter / User Account</div>
                      <div className="text-xs text-slate-400">Search, book slots, get QR passes & report issues</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
