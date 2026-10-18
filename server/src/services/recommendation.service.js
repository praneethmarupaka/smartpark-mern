import { calculateHaversineDistanceKm } from '../utils/geo.utils.js';

/**
 * Transparent Scoring Recommendation Engine
 * Factors evaluated:
 * 1. Distance (up to 35 pts)
 * 2. Verification status (up to 20 pts)
 * 3. Price / Affordability (up to 20 pts)
 * 4. Fresh Availability / Slots (up to 15 pts)
 * 5. Booking support & Access ease (up to 10 pts)
 */
export const scoreParkingFacilities = (
  facilities,
  {
    userLat = null,
    userLng = null,
    vehicleType = 'FOUR_WHEELER',
    priority = 'best_overall' // 'best_overall', 'nearest', 'lowest_price', 'verified', 'fresh_availability'
  }
) => {
  const scored = facilities.map((facility) => {
    let score = 0;
    const reasons = [];

    // 1. Distance calculation
    let distanceKm = null;
    if (
      userLat !== null &&
      userLng !== null &&
      facility.location &&
      facility.location.coordinates &&
      facility.location.coordinates.length === 2
    ) {
      const [fLng, fLat] = facility.location.coordinates;
      distanceKm = calculateHaversineDistanceKm(userLat, userLng, fLat, fLng);

      if (distanceKm <= 1.0) {
        score += 35;
        reasons.push('Within 1 km of your location');
      } else if (distanceKm <= 3.0) {
        score += 25;
        reasons.push('Near the destination');
      } else if (distanceKm <= 7.0) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // 2. Verification Status
    if (facility.verificationStatus === 'VERIFIED') {
      score += 20;
      reasons.push('Verified location');
    } else if (facility.verificationStatus === 'PENDING') {
      score += 5;
    }

    // 3. Pricing
    const rate =
      vehicleType === 'TWO_WHEELER'
        ? facility.pricing?.twoWheelerHourlyRate
        : facility.pricing?.fourWheelerHourlyRate;

    if (facility.pricingModel === 'FREE') {
      score += 20;
      reasons.push('Free parking listed');
    } else if (rate !== null && rate !== undefined && rate <= 30) {
      score += 15;
      reasons.push('Lower listed price');
    } else if (rate !== null && rate !== undefined && rate <= 60) {
      score += 10;
    } else if (facility.pricingModel === 'UNKNOWN') {
      score += 5; // Neutral
    }

    // 4. Vehicle Compatibility
    if (facility.supportedVehicleTypes && facility.supportedVehicleTypes.includes(vehicleType)) {
      score += 5;
      reasons.push('Supports the selected vehicle');
    }

    // 5. Availability Freshness & Slots
    if (facility.availableSlots && (facility.availableSlots.total > 0 || facility.availableSlots.fourWheeler > 0)) {
      score += 10;
      if (facility.lastAvailabilityUpdate) {
        const hoursSinceUpdate = (Date.now() - new Date(facility.lastAvailabilityUpdate).getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 4) {
          score += 10;
          reasons.push('Availability recently updated');
        }
      }
    }

    // 6. Booking support
    if (facility.bookingSupported) {
      score += 5;
      reasons.push('Online reservation supported');
    }

    // 7. Operational Status check
    if (facility.operationalStatus !== 'OPEN') {
      score = 0;
    }

    // Priority adjustments
    let finalScore = score;
    if (priority === 'nearest' && distanceKm !== null) {
      finalScore = 100 - Math.min(distanceKm * 5, 95);
    } else if (priority === 'lowest_price') {
      const priceVal = facility.pricingModel === 'FREE' ? 0 : rate || 999;
      finalScore = 100 - Math.min(priceVal, 95);
    } else if (priority === 'verified') {
      finalScore = (facility.verificationStatus === 'VERIFIED' ? 50 : 0) + score * 0.5;
    } else if (priority === 'fresh_availability') {
      finalScore = (facility.lastAvailabilityUpdate ? 50 : 0) + score * 0.5;
    }

    return {
      facility,
      distanceKm,
      score: Math.round(finalScore),
      reasons: reasons.slice(0, 3)
    };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
};
