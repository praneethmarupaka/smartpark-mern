import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  QrCode,
  BarChart3,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
  AlertOctagon,
  Users,
  History,
  FileText,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export const DashboardLayout = ({ role = 'owner' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const ownerNavItems = [
    { label: 'Overview', to: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Facilities', to: '/owner/facilities', icon: Building2 },
    { label: 'Add Parking', to: '/owner/facilities/new', icon: PlusCircle },
    { label: 'Validate QR', to: '/owner/validate-qr', icon: QrCode },
    { label: 'Facility Bookings', to: '/owner/bookings', icon: CheckSquare },
    { label: 'Analytics', to: '/owner/analytics', icon: BarChart3 }
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verification Queue', to: '/admin/verification', icon: ShieldCheck },
    { label: 'Directory Management', to: '/admin/directory', icon: Building2 },
    { label: 'Data Import (CSV)', to: '/admin/import', icon: FileSpreadsheet },
    { label: 'Coverage Metrics', to: '/admin/coverage', icon: BarChart3 },
    { label: 'User Reports', to: '/admin/reports', icon: AlertOctagon },
    { label: 'Users & Roles', to: '/admin/users', icon: Users },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: History }
  ];

  const navItems = role === 'admin' ? adminNavItems : ownerNavItems;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-base">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs">
              SP
            </span>
            <span>SmartPark</span>
          </Link>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}
          >
            {role}
          </span>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/owner/dashboard' || item.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User info and exit */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/discover"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-2 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Portal
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
