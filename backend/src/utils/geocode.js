import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';

let geocodingClient;

function getClient() {
  if (!geocodingClient) {
    const mapboxToken = process.env.MAPBOX_API_KEY;
    if (!mapboxToken) {
      throw new Error('MAPBOX_API_KEY is not defined in environment');
    }
    geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
  }
  return geocodingClient;
}

export const getCoordinatesFromAddress = async (address) => {
  try {
    const client = getClient();
    const response = await client
      .forwardGeocode({
        query: address,
        limit: 1,
      })
      .send();

    const match = response.body.features[0];
    return match ? match.geometry.coordinates : null;
  } catch (err) {
    console.error('Error fetching coordinates:', err.message);
    return null;
  }
};

// Helper function to calculate distance (in meters) between two [lng, lat] points
export function getDistanceFromCoords(coord1, coord2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return dist;
}