/**
 * Calculate overall risk score from individual analyses
 * @param {Object} imageAnalysis - Image comparison results
 * @param {Object} priceAnalysis - Price history results
 * @param {Object} textAnalysis - Text analysis results
 * @returns {Object} Overall risk assessment
 */
export function calculateOverallRisk(imageAnalysis, priceAnalysis, textAnalysis) {
  // Weight: Image (40%), Price (30%), Text (30%)
  const weights = {
    image: 0.4,
    price: 0.3,
    text: 0.3
  };

  const scores = {
    image: imageAnalysis?.confidence || 0,
    price: priceAnalysis?.confidence || 0,
    text: textAnalysis?.confidence || 0
  };

  // Calculate weighted average
  const overallScore = Math.round(
    scores.image * weights.image +
    scores.price * weights.price +
    scores.text * weights.text
  );

  // Determine risk level
  let level = 'low';
  if (overallScore >= 71) {
    level = 'high';
  } else if (overallScore >= 41) {
    level = 'medium';
  }

  // Count total flags
  const flagCount =
    (imageAnalysis?.discrepancies?.length || 0) +
    (priceAnalysis?.dropCount || 0) +
    (textAnalysis?.redFlags?.length || 0);

  return {
    score: overallScore,
    level,
    flagCount
  };
}

/**
 * Calculate risk level from confidence score
 * @param {number} confidence - Confidence score (0-100)
 * @returns {string} Risk level (low/medium/high)
 */
export function getRiskLevel(confidence) {
  if (confidence >= 71) return 'high';
  if (confidence >= 41) return 'medium';
  return 'low';
}

/**
 * Get risk color based on level
 * @param {string} level - Risk level (low/medium/high)
 * @returns {string} Tailwind color class
 */
export function getRiskColor(level) {
  const colors = {
    low: 'text-success-700 bg-gradient-to-br from-success-50 to-success-100/50 border-success-300',
    medium: 'text-warning-700 bg-gradient-to-br from-warning-50 to-warning-100/50 border-warning-300',
    high: 'text-danger-700 bg-gradient-to-br from-danger-50 to-danger-100/50 border-danger-300'
  };
  return colors[level] || colors.low;
}

/**
 * Get risk icon SVG based on level
 * @param {string} level - Risk level (low/medium/high)
 * @returns {Object} Icon configuration with SVG path
 */
export function getRiskIcon(level) {
  const icons = {
    low: {
      path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-success-600'
    },
    medium: {
      path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'text-warning-600'
    },
    high: {
      path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-danger-600'
    }
  };
  return icons[level] || icons.low;
}
