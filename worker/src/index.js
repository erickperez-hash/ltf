/**
 * Cloudflare Worker for Listing Truth Finder API
 * Handles Apify scraping requests to avoid CORS issues
 */

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle CORS preflight requests
 */
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders
  });
}

/**
 * Scrape Zillow listing using Apify
 */
async function scrapeZillow(url, apifyToken) {
  const actorId = 'maxcopell~zillow-detail-scraper';
  const apiEndpoint = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`;

  const input = {
    startUrls: [{ url: url }]
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', response.status, errorText);
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('No data returned from Zillow scraper');
    }

    return data[0];
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

/**
 * Transform listing data to consistent format
 */
function transformListingData(listing) {
  // Extract address fields from the nested address object
  const addressObj = listing.address || {};
  const address = addressObj.streetAddress || listing.streetAddress || '';
  const city = addressObj.city || listing.city || '';
  const state = addressObj.state || listing.state || '';
  const zipcode = addressObj.zipcode || listing.zipcode || '';

  // Price is already a number in the API response
  const price = listing.price || 0;

  // Parse price history
  let priceHistory = [];
  if (listing.priceHistory && Array.isArray(listing.priceHistory)) {
    priceHistory = listing.priceHistory.map(item => ({
      date: item.date || item.time || new Date().toISOString(),
      price: typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[$,]/g, '')) || 0,
      event: item.event || item.priceChangeRate || 'Price change'
    }));
  }

  // Get images from the responsivePhotos or photos array
  let images = [];
  if (listing.responsivePhotos && Array.isArray(listing.responsivePhotos)) {
    images = listing.responsivePhotos.map(photo => {
      // Extract the largest image URL
      if (photo.mixedSources && photo.mixedSources.jpeg && Array.isArray(photo.mixedSources.jpeg)) {
        const largestImage = photo.mixedSources.jpeg[photo.mixedSources.jpeg.length - 1];
        return largestImage ? largestImage.url : null;
      }
      return null;
    }).filter(url => url !== null);
  } else if (listing.photos && Array.isArray(listing.photos)) {
    images = listing.photos.map(photo => photo.url || photo).filter(url => url);
  } else if (listing.imgSrc) {
    images = [listing.imgSrc];
  }

  // Get description
  const description = listing.description || listing.homeDescription || '';

  // Get days on market
  const daysOnMarket = listing.daysOnZillow || listing.timeOnZillow || 0;

  return {
    address,
    city,
    state,
    zipcode,
    price,
    priceHistory,
    description,
    images,
    daysOnMarket,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    yearBuilt: listing.yearBuilt || null
  };
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Ignore favicon requests
    const url = new URL(request.url);
    if (url.pathname === '/favicon.ico' || url.pathname.endsWith('.svg')) {
      return new Response(null, { status: 404 });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Parse request body
      const body = await request.json();
      const { url } = body;

      if (!url) {
        return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Validate Zillow URL
      if (!url.includes('zillow.com')) {
        return new Response(JSON.stringify({ error: 'Must be a Zillow URL' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get Apify token from environment
      const apifyToken = env.APIFY_TOKEN;
      if (!apifyToken) {
        console.error('APIFY_TOKEN not configured');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      console.log('Scraping Zillow listing:', url);

      // Scrape the listing
      const rawListing = await scrapeZillow(url, apifyToken);

      // Transform the data
      const listing = transformListingData(rawListing);

      console.log('Scraping successful');

      // Return the transformed data
      return new Response(JSON.stringify(listing), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);

      return new Response(JSON.stringify({
        error: error.message || 'An error occurred while scraping the listing'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
