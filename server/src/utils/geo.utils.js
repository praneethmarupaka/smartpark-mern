/**
 * Validate latitude and longitude values
 * Longitude: -180 to 180
 * Latitude: -90 to 90
 */
export const isValidCoordinates = (lng, lat) => {
  if (typeof lng !== 'number' || typeof lat !== 'number') return false;
  if (isNaN(lng) || isNaN(lat)) return false;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

/**
 * Creates standard GeoJSON Point object: [longitude, latitude]
 */
export const createGeoPoint = (lng, lat) => {
  if (!isValidCoordinates(lng, lat)) {
    return null;
  }
  return {
    type: 'Point',
    coordinates: [Number(lng), Number(lat)]
  };
};

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
export const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Hyderabad bounding box for validation and centering
 * Approximate center: Lat 17.385044, Lng 78.486671
 */
export const HYDERABAD_CENTER = {
  lat: 17.385044,
  lng: 78.486671
};
