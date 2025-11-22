import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true // Required for browser usage
});

/**
 * Convert image URL to base64
 * @param {string} url - Image URL
 * @returns {Promise<Object>} Base64 data and media type
 */
async function urlToBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const base64 = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Determine media type from URL or response
    let mediaType = 'image/jpeg';
    const contentType = response.headers['content-type'];
    if (contentType && contentType.startsWith('image/')) {
      mediaType = contentType;
    }

    return { base64, mediaType };
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to load image');
  }
}

/**
 * Compare two property images using Claude Vision
 * @param {string} listingImageUrl - URL of listing photo
 * @param {string} streetViewUrl - URL of Street View image
 * @returns {Promise<Object>} Analysis results
 */
export async function compareImages(listingImageUrl, streetViewUrl) {
  try {
    // Convert both images to base64
    const listing = await urlToBase64(listingImageUrl);
    const streetView = await urlToBase64(streetViewUrl);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: listing.mediaType,
              data: listing.base64,
            },
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: streetView.mediaType,
              data: streetView.base64,
            },
          },
          {
            type: 'text',
            text: `Compare these two images of the same property exterior.

Image 1: Real estate listing photo
Image 2: Google Street View

ANALYZE FOR:
- Structural differences (added/removed features like porches, garages, windows)
- Color changes (paint, materials, siding)
- Architectural mismatches
- Signs of photo manipulation or enhancement

RESPOND IN JSON FORMAT ONLY:
{
  "confidence": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "discrepancies": [
    "<specific difference 1>",
    "<specific difference 2>"
  ],
  "verdict": "<brief summary>"
}

Risk level guidelines:
- low (0-40): Minor differences likely due to seasonal changes, angles, or time of day
- medium (41-70): Notable differences that should be verified
- high (71-100): Major structural mismatches or obvious manipulation

BE SPECIFIC. Use evidence from the images. If images are very similar, say so.`
          }
        ]
      }]
    });

    const content = message.content[0].text;

    // Extract JSON from response (handle code blocks)
    let jsonText = content;
    if (content.includes('```')) {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }

    const result = JSON.parse(jsonText);

    return {
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      discrepancies: result.discrepancies || [],
      verdict: result.verdict,
      listingImage: listingImageUrl,
      streetViewImage: streetViewUrl
    };
  } catch (error) {
    console.error('Claude Vision error:', error);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

/**
 * Analyze listing description for misleading language
 * @param {string} description - Listing description text
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeDescription(description) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this real estate listing description for misleading language.

DESCRIPTION:
"""
${description}
"""

Flag euphemisms that hide problems:
- "Cozy" = very small
- "Charming" = old/outdated
- "Up-and-coming" = currently undesirable area
- "Needs TLC" = major repairs needed
- "Fixer-upper" = extensive repairs needed
- "As-is" = seller won't fix anything
- "Investment opportunity" = uninhabitable or major work
- Similar euphemistic phrases

RESPOND IN JSON FORMAT ONLY:
{
  "confidence": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "redFlags": [
    {
      "phrase": "<exact phrase from listing>",
      "translation": "<honest meaning>"
    }
  ],
  "recommendations": [
    "<question to ask landlord/agent>"
  ]
}

Risk level guidelines:
- low (0-40): 0-1 red flags, minor concerns
- medium (41-70): 2-3 red flags
- high (71-100): 4+ red flags or very serious concerns

Only flag ACTUALLY misleading language. Standard real estate terms are fine.`
      }]
    });

    const content = message.content[0].text;

    // Extract JSON from response
    let jsonText = content;
    if (content.includes('```')) {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }

    const result = JSON.parse(jsonText);

    return {
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      redFlags: result.redFlags || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Claude text analysis error:', error);
    throw new Error(`Description analysis failed: ${error.message}`);
  }
}
