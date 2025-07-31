import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const mapboxToken = process.env.MAPBOX_API_KEY;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

export const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await geocodingClient
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
