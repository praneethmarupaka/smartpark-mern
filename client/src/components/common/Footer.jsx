import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, MapPin, ExternalLink, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              SmartPark Hyderabad
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifiable, community-audited smart parking directory and booking platform serving commuters across the Greater Hyderabad municipal region.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Admin Verified Directory
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-white transition-colors">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link to="/discover?category=TRANSPORT" className="hover:text-white transition-colors">
                  Metro & Railway Stations
                </Link>
              </li>
              <li>
                <Link to="/discover?category=GHMC" className="hover:text-white transition-colors">
                  GHMC Parking Grounds
                </Link>
              </li>
              <li>
                <Link to="/discover?category=COMMERCIAL" className="hover:text-white transition-colors">
                  Shopping Malls & Complexes
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Governance */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Directory & Transparency</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Verification Methodology
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#scoring" className="hover:text-white transition-colors">
                  Transparent Scoring Model
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Leaflet & OpenStreetMap attribution
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  Data provenance tracking
                </span>
              </li>
            </ul>
          </div>

          {/* Hyderabad Info & Demo Credentials */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              B.Tech Portfolio Demo
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MERN Stack Architecture with geospatial 2dsphere indexing and JWT authentication.
            </p>
            <div className="pt-2 border-t border-slate-700/60 text-[11px] space-y-1">
              <div>
                <span className="text-slate-300 font-medium">Admin: </span>
                <code className="text-emerald-400">admin@smartpark.hyderabad.gov</code>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Owner: </span>
                <code className="text-indigo-400">owner@hyderabadmetro.org</code>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Password: </span>
                <code className="text-slate-200">AdminSecurePass#2026 / OwnerPass#2026</code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartPark Hyderabad. Built with clean MERN stack engineering.</p>
        </div>
      </div>
    </footer>
  );
};
