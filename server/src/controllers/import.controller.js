import { ImportService } from '../services/import.service.js';
import { DataImportJob } from '../models/DataImportJob.model.js';
import { Parking } from '../models/Parking.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../services/audit.service.js';

export const previewImport = async (req, res, next) => {
  try {
    const { records = [], format = 'CSV' } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return ApiResponse.error(res, 'No records provided for preview', 400);
    }

    const previewList = [];
    let duplicateCount = 0;
    let validCount = 0;
    let missingCoordsCount = 0;

    for (const item of records.slice(0, 50)) {
      const name = (item.name || '').trim();
      const locality = (item.locality || '').trim();

      const existing = await Parking.findOne({
        name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        locality: { $regex: new RegExp(`^${locality.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).select('name locality verificationStatus');

      const hasCoords = !isNaN(parseFloat(item.latitude || item.lat)) && !isNaN(parseFloat(item.longitude || item.lng));
      if (!hasCoords) missingCoordsCount++;
      if (existing) duplicateCount++;
      else validCount++;

      previewList.push({
        name,
        locality,
        address: item.address,
        category: item.category || 'PUBLIC',
        hasCoordinates: hasCoords,
        isPotentialDuplicate: !!existing,
        existingMatch: existing ? `${existing.name} (${existing.locality})` : null
      });
    }

    return ApiResponse.success(
      res,
      {
        totalRecordsInPayload: records.length,
        samplePreview: previewList,
        summary: {
          duplicateCount,
          validCount,
          missingCoordsCount
        }
      },
      'Import preview generated'
    );
  } catch (error) {
    next(error);
  }
};

export const commitImport = async (req, res, next) => {
  try {
    const {
      records = [],
      fileName = 'manual_import.csv',
      format = 'CSV',
      sourceName = 'Admin Import',
      sourceReference = ''
    } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return ApiResponse.error(res, 'No records provided for import', 400);
    }

    const job = await ImportService.processImportRecords({
      records,
      fileName,
      format,
      sourceName,
      sourceReference,
      executedBy: req.user._id
    });

    await logAuditEvent({
      performedBy: req.user._id,
      action: 'DATA_IMPORT_COMMITTED',
      targetEntity: 'IMPORT_JOB',
      targetId: job._id,
      newState: {
        totalRecords: job.totalRecords,
        importedCount: job.importedCount,
        duplicateCount: job.duplicateCount,
        invalidCount: job.invalidCount
      },
      reason: `Imported ${job.importedCount} records from ${fileName}`
    });

    return ApiResponse.created(res, { job }, 'Import processing completed successfully');
  } catch (error) {
    next(error);
  }
};

export const getImportHistory = async (req, res, next) => {
  try {
    const jobs = await DataImportJob.find()
      .populate('executedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return ApiResponse.success(res, { jobs }, 'Import jobs history retrieved');
  } catch (error) {
    next(error);
  }
};
