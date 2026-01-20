
/**
 * Location utility functions for emergency response system
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Sort locations by distance from current position
 */
export function sortByDistance<T extends { latitude?: number; longitude?: number }>(
  locations: T[],
  currentLat: number,
  currentLon: number
): (T & { distance: number })[] {
  return locations
    .map((location) => {
      if (location.latitude && location.longitude) {
        const distance = calculateDistance(
          currentLat,
          currentLon,
          location.latitude,
          location.longitude
        );
        return { ...location, distance };
      }
      return { ...location, distance: 999 };
    })
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Generate Google Maps link for coordinates
 */
export function generateMapsLink(lat: number, lon: number, label?: string): string {
  if (label) {
    return `https://maps.google.com/?q=${lat},${lon}&label=${encodeURIComponent(label)}`;
  }
  return `https://maps.google.com/?q=${lat},${lon}`;
}

/**
 * Generate directions link from current location to destination
 */
export function generateDirectionsLink(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): string {
  return `https://maps.google.com/maps?saddr=${fromLat},${fromLon}&daddr=${toLat},${toLon}`;
}

/**
 * Format location for SMS message
 */
export function formatLocationForSMS(lat: number, lon: number): string {
  return `Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}\nMap: ${generateMapsLink(lat, lon)}`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
}

/**
 * Calculate estimated time of arrival based on distance
 * Assumes average speed of 40 km/h in urban areas
 */
export function calculateETA(distanceKm: number): string {
  const avgSpeedKmh = 40;
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  if (timeMinutes < 1) {
    return 'Less than 1 minute';
  } else if (timeMinutes === 1) {
    return '1 minute';
  } else if (timeMinutes < 60) {
    return `${timeMinutes} minutes`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`;
  }
}

/**
 * Check if location has moved significantly (more than 50 meters)
 */
export function hasLocationChanged(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  thresholdKm: number = 0.05 // 50 meters
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance >= thresholdKm;
}

/**
 * Get location accuracy description
 */
export function getAccuracyDescription(accuracyMeters: number): string {
  if (accuracyMeters < 10) {
    return 'Excellent';
  } else if (accuracyMeters < 50) {
    return 'Good';
  } else if (accuracyMeters < 100) {
    return 'Fair';
  } else {
    return 'Poor';
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}

/**
 * Get nearest locations from a list
 */
export function getNearestLocations<T extends { latitude?: number; longitude?: number }>(
  locations: T[],
  currentLat: number,
  currentLon: number,
  count: number = 3
): (T & { distance: number })[] {
  const sorted = sortByDistance(locations, currentLat, currentLon);
  return sorted.slice(0, count);
}

/**
 * Check if coordinates are valid
 */
export function areCoordinatesValid(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Get location status message
 */
export function getLocationStatusMessage(
  hasPermission: boolean,
  location: { latitude: number; longitude: number } | null
): string {
  if (!hasPermission) {
    return 'Location permission denied. Please enable location services in settings.';
  }
  
  if (!location) {
    return 'Getting your location...';
  }
  
  return 'Location acquired successfully';
}
