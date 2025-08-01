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
