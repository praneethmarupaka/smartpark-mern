import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage.jsx';
import { DiscoveryPage } from '../pages/public/DiscoveryPage.jsx';
import { ParkingDetailPage } from '../pages/public/ParkingDetailPage.jsx';
import { HowItWorksPage } from '../pages/public/HowItWorksPage.jsx';
import { NotFoundPage } from '../pages/public/NotFoundPage.jsx';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';

// User Pages
import { UserProfilePage } from '../pages/user/UserProfilePage.jsx';
import { FavoritesPage } from '../pages/user/FavoritesPage.jsx';
import { MyBookingsPage } from '../pages/user/MyBookingsPage.jsx';

// Owner Pages
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage.jsx';
import { MyParkingPage } from '../pages/owner/MyParkingPage.jsx';
import { AddParkingPage } from '../pages/owner/AddParkingPage.jsx';
import { EditParkingPage } from '../pages/owner/EditParkingPage.jsx';
import { QrValidationPage } from '../pages/owner/QrValidationPage.jsx';
import { OwnerBookingsPage } from '../pages/owner/OwnerBookingsPage.jsx';
import { OwnerAnalyticsPage } from '../pages/owner/OwnerAnalyticsPage.jsx';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';
import { VerificationQueuePage } from '../pages/admin/VerificationQueuePage.jsx';
import { DirectoryManagementPage } from '../pages/admin/DirectoryManagementPage.jsx';
import { ImportParkingPage } from '../pages/admin/ImportParkingPage.jsx';
import { CoverageDashboardPage } from '../pages/admin/CoverageDashboardPage.jsx';
import { UserReportsPage } from '../pages/admin/UserReportsPage.jsx';
import { UserManagementPage } from '../pages/admin/UserManagementPage.jsx';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Top Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/parking/:id" element={<ParkingDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Commuter Pages */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']}>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Owner Dashboard with Sidebar Layout */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
            <DashboardLayout role="owner" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="facilities" element={<MyParkingPage />} />
        <Route path="facilities/new" element={<AddParkingPage />} />
        <Route path="facilities/:id/edit" element={<EditParkingPage />} />
        <Route path="validate-qr" element={<QrValidationPage />} />
        <Route path="bookings" element={<OwnerBookingsPage />} />
        <Route path="analytics" element={<OwnerAnalyticsPage />} />
      </Route>

      {/* Administrator Dashboard with Sidebar Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="verification" element={<VerificationQueuePage />} />
        <Route path="directory" element={<DirectoryManagementPage />} />
        <Route path="import" element={<ImportParkingPage />} />
        <Route path="coverage" element={<CoverageDashboardPage />} />
        <Route path="reports" element={<UserReportsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
};
