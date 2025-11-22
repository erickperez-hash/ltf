import axios from 'axios';
import { getApiEndpoint } from '../config';

/**
 * Scrape Zillow listing via our Cloudflare Workers backend
 * This avoids CORS issues by proxying through our own API
 * @param {string} url - Zillow listing URL
 * @returns {Promise<Object>} Listing data
 */
export async function scrapeZillow(url) {
  try {
    console.log('Scraping Zillow via backend API:', url);

    // Get the backend API endpoint
    const apiEndpoint = getApiEndpoint();

    console.log('Using API endpoint:', apiEndpoint);

    // Call our Cloudflare Worker backend
    const response = await axios.post(
      apiEndpoint,
      { url },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 180000 // 3 minutes timeout
      }
    );

    console.log('Backend API response received:', response.status);

    if (!response.data) {
      throw new Error('No data returned from backend API');
    }

    const listing = response.data;
    console.log('Listing data:', listing);

    return listing;

  } catch (error) {
    console.error('Scraping error:', error);

    // Provide helpful error messages
    if (error.code === 'ECONNABORTED') {
      throw new Error('Scraping timeout - Zillow may be slow to respond. Please try again.');
    } else if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400) {
        throw new Error(errorData?.error || 'Invalid request - please check the Zillow URL');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (status === 500) {
        throw new Error(errorData?.error || 'Server error while scraping. Please try again.');
      } else {
        throw new Error(`Backend error: ${errorData?.error || error.response.statusText}`);
      }
    } else if (error.request) {
      throw new Error('Network error - unable to reach backend API. Check your internet connection.');
    } else {
      throw new Error(`Failed to scrape listing: ${error.message}`);
    }
  }
}

/**
 * Parse Zillow URL to extract property ID
 */
export function extractZillowId(url) {
  const match = url.match(/\/(\d+)_zpid/);
  return match ? match[1] : null;
}
