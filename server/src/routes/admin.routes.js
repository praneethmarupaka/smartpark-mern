import { Router } from 'express';
import {
  getAdminDashboard,
  getPendingParkings,
  updateVerification,
  updateStatus,
  getReports,
  updateReport,
  getCoverageStats,
  getAuditLogs,
  getUsers,
  toggleUserStatus
} from '../controllers/admin.controller.js';
import {
  previewImport,
  commitImport,
  getImportHistory
} from '../controllers/import.controller.js';
import { getParkings } from '../controllers/parking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Protect all admin endpoints with strict authentication and role check
router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/parking', getParkings);
router.get('/parking/pending', getPendingParkings);
router.patch('/parking/:id/verification', updateVerification);
router.patch('/parking/:id/status', updateStatus);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);

router.post('/import/preview', previewImport);
router.post('/import/commit', commitImport);
router.get('/imports', getImportHistory);

router.get('/coverage', getCoverageStats);
router.get('/audit-logs', getAuditLogs);

router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
