import axios from 'axios';

/**
 * Get Google Street View image for an address
 * @param {string} address - Full address
 * @returns {Promise<string>} Street View image URL
 */
export async function getStreetView(address) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  if (!address) {
    throw new Error('Address is required');
  }

  // Construct Street View Static API URL
  const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    // Check if Street View is available by testing the metadata endpoint
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await axios.get(metadataUrl);

    if (response.data.status !== 'OK') {
      throw new Error('Street View not available for this address');
    }

    return url;
  } catch (error) {
    console.error('Street View error:', error);
    throw new Error('Street View not available for this address');
  }
}

/**
 * Convert image URL to base64
 * @param {string} url - Image URL
 * @returns {Promise<string>} Base64 encoded image
 */
export async function urlToBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to load image');
  }
}
