import { Parking } from '../models/Parking.model.js';
import { DataImportJob } from '../models/DataImportJob.model.js';
import { isValidCoordinates } from '../utils/geo.utils.js';

export class ImportService {
  /**
   * Parse and validate records array (from CSV or GeoJSON)
   */
  static async processImportRecords({
    records,
    fileName,
    format,
    sourceName = 'Directory Import',
    sourceReference = '',
    executedBy
  }) {
    const importJob = await DataImportJob.create({
      fileName,
      format,
      sourceName,
      sourceReference,
      totalRecords: records.length,
      status: 'PROCESSING',
      executedBy
    });

    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    const errors = [];

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNumber = index + 1;

      try {
        const name = (row.name || '').trim();
        const address = (row.address || '').trim();
        const locality = (row.locality || '').trim();

        if (!name || name.length < 2) {
          invalidCount++;
          errors.push({
            row: rowNumber,
            recordName: name || 'Unnamed',
            reason: 'Missing or too short name'
          });
          continue;
        }

        if (!locality) {
          invalidCount++;
          errors.push({
            row: rowNumber,
            recordName: name,
            reason: 'Missing required locality'
          });
          continue;
        }

        // Check for duplicate in database
        const existing = await Parking.findOne({
          name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          locality: { $regex: new RegExp(`^${locality.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existing) {
          duplicateCount++;
          errors.push({
            row: rowNumber,
            recordName: name,
            reason: `Potential duplicate of existing parking "${existing.name}" in ${existing.locality}`
          });
          continue;
        }

        // Parse coordinates
        let lng = parseFloat(row.longitude || row.lng);
        let lat = parseFloat(row.latitude || row.lat);
        let hasCoords = false;
        let location = undefined;

        if (isValidCoordinates(lng, lat)) {
          hasCoords = true;
          location = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        }

        // Supported vehicle types
        let supportedVehicleTypes = ['TWO_WHEELER', 'FOUR_WHEELER'];
        if (row.supportedVehicleTypes) {
          if (Array.isArray(row.supportedVehicleTypes)) {
            supportedVehicleTypes = row.supportedVehicleTypes;
          } else {
            supportedVehicleTypes = row.supportedVehicleTypes
              .split(/[,;|]/)
              .map((t) => t.trim().toUpperCase())
              .filter(Boolean);
          }
        }

        // Pricing model
        let pricingModel = (row.pricingModel || 'UNKNOWN').toUpperCase();
        if (!['FREE', 'PAID', 'VARIABLE', 'UNKNOWN'].includes(pricingModel)) {
          pricingModel = 'UNKNOWN';
        }

        // Category
        let category = (row.category || 'PUBLIC').toUpperCase();
        if (!['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'GOVERNMENT', 'GHMC', 'TRANSPORT', 'OTHER'].includes(category)) {
          category = 'OTHER';
        }

        // Capacity
        const twCap = parseInt(row.twoWheelerCapacity || row.twoWheelerCap) || 0;
        const fwCap = parseInt(row.fourWheelerCapacity || row.fourWheelerCap) || 0;
        const totalCap = parseInt(row.totalCapacity) || (twCap + fwCap > 0 ? twCap + fwCap : null);

        // Pricing rates
        const twRate = parseFloat(row.twoWheelerHourlyRate || row.twoWheelerRate) || null;
        const fwRate = parseFloat(row.fourWheelerHourlyRate || row.fourWheelerRate) || null;

        await Parking.create({
          name,
          category,
          facilityType: row.facilityType || 'Other legitimate parking facilities',
          address: address || `${name}, ${locality}`,
          locality,
          city: row.city || 'Hyderabad',
          state: row.state || 'Telangana',
          postalCode: row.postalCode || '',
          location,
          hasCoordinates: hasCoords,
          supportedVehicleTypes,
          publicAccess: row.publicAccess || 'PUBLIC',
          accessInstructions: row.accessInstructions || '',
          pricingModel,
          pricing: {
            twoWheelerHourlyRate: twRate,
            fourWheelerHourlyRate: fwRate,
            dailyPassRate: parseFloat(row.dailyPassRate) || null,
            currency: 'INR'
          },
          totalCapacity: {
            twoWheeler: twCap || null,
            fourWheeler: fwCap || null,
            total: totalCap
          },
          availableSlots: {
            twoWheeler: twCap || null,
            fourWheeler: fwCap || null,
            total: totalCap
          },
          openingHours: {
            is24x7: row.is24x7 === 'true' || row.is24x7 === true,
            opensAt: row.opensAt || '06:00',
            closesAt: row.closesAt || '22:00'
          },
          bookingSupported: row.bookingSupported === 'true' || row.bookingSupported === true,
          dataSource: sourceName,
          sourceReference: sourceReference || row.sourceReference || '',
          importedAt: new Date(),
          verificationStatus: 'UNVERIFIED', // NEVER automatically mark VERIFIED
          operationalStatus: row.operationalStatus || 'OPEN'
        });

        importedCount++;
      } catch (err) {
        invalidCount++;
        errors.push({
          row: rowNumber,
          recordName: records[index].name || `Row ${rowNumber}`,
          reason: err.message
        });
      }
    }

    importJob.importedCount = importedCount;
    importJob.duplicateCount = duplicateCount;
    importJob.invalidCount = invalidCount;
    importJob.importErrors = errors;
    importJob.status = 'COMPLETED';
    await importJob.save();

    return importJob;
  }
}
