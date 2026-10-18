import { AuditLog } from '../models/AuditLog.model.js';

export const logAuditEvent = async ({
  performedBy,
  action,
  targetEntity,
  targetId = null,
  previousState = null,
  newState = null,
  reason = '',
  ipAddress = ''
}) => {
  try {
    await AuditLog.create({
      performedBy,
      action,
      targetEntity,
      targetId,
      previousState,
      newState,
      reason,
      ipAddress
    });
  } catch (error) {
    console.error('[AuditLog Error]: Failed to record audit log:', error.message);
  }
};
