/**
 * Extract address from Zillow listing data
 * @param {Object} listingData - Scraped Zillow data
 * @returns {string} Full address
 */
export function extractAddress(listingData) {
  if (!listingData) return '';

  // Try different possible address fields from Apify data
  if (listingData.address) {
    if (typeof listingData.address === 'string') {
      return listingData.address;
    }
    // Handle structured address object
    const { streetAddress, city, state, zipcode } = listingData.address;
    return `${streetAddress}, ${city}, ${state} ${zipcode}`;
  }

  // Fallback to other possible fields
  return listingData.fullAddress || listingData.location || '';
}

/**
 * Validate Zillow URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result with valid boolean and error message
 */
export function validateZillowUrl(url) {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'Please enter a URL' };
  }

  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes('zillow.com')) {
      return { valid: false, error: 'Must be a Zillow URL' };
    }

    if (!parsed.pathname.includes('homedetails') && !parsed.pathname.includes('b/')) {
      return { valid: false, error: 'Must be a property listing URL' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
