import React from 'react';
import { ShieldCheck, CheckCircle2, Compass, Layers, Database, Sparkles, AlertTriangle } from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Architecture & Verification Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How SmartPark Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          SmartPark is a structured, verifiable urban parking directory and reservation platform for Hyderabad. Here is how our data verification, transparent scoring, and booking lifecycle operate.
        </p>
      </div>

      {/* Verification Pipeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          The 3-Tier Verification Pipeline
        </h2>
        <p className="text-sm text-slate-600">
          Unlike platforms that assume all scraped records are accurate, SmartPark categorizes every facility with explicit verification flags:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-sm block">1. UNVERIFIED</span>
            <p className="text-slate-600 leading-relaxed">
              Imported via OpenStreetMap or municipal CSVs. Coordinates and tariffs have not yet been physically validated by an administrator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 text-sm block">2. PENDING REVIEW</span>
            <p className="text-amber-800 leading-relaxed">
              Submitted by facility owners or commercial operators with supporting evidence. Held in admin review queue before public verification badge is issued.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 text-sm block">3. VERIFIED</span>
            <p className="text-emerald-800 leading-relaxed">
              Inspected and confirmed against official gazettes, traffic police surveys, or verified on-site by administrator audit.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Engine */}
      <div id="scoring" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Transparent Recommendation Scoring Formula
        </h2>
        <p className="text-sm text-slate-600">
          We do not use opaque algorithms. Recommendations are computed deterministically across 5 quantifiable metrics:
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-slate-800 text-sm block">Geospatial Distance</strong>
              <span className="text-slate-500">Haversine formula from commuter's GPS location</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Up to 35 pts</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-slate-800 text-sm block">Directory Verification Status</strong>
              <span className="text-slate-500">Admin-audited authenticity badge</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Up to 20 pts</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-slate-800 text-sm block">Tariff Affordability</strong>
              <span className="text-slate-500">Free parking receives top points; scaled by hourly rate</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Up to 20 pts</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-slate-800 text-sm block">Availability Freshness</strong>
              <span className="text-slate-500">Operator updates within 4 hours; stale reports penalized</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Up to 15 pts</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-slate-800 text-sm block">Reservation & Access Compatibility</strong>
              <span className="text-slate-500">Online reservation support and vehicle match</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Up to 10 pts</span>
          </div>
        </div>
      </div>

      {/* Attribution & Open Data Note */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 md:p-8 space-y-4 text-xs leading-relaxed">
        <h3 className="text-white font-bold text-sm">Data Provenance & OpenStreetMap Attribution</h3>
        <p>
          Map tiles are provided via Leaflet and OpenStreetMap contributors in accordance with OpenStreetMap tile usage policies. We do not claim complete city-wide coverage. Coverage metrics and audit logs are visible directly on the platform coverage dashboard.
        </p>
      </div>
    </div>
  );
};
