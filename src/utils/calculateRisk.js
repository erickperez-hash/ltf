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
    low: 'text-risk-low bg-green-50 border-green-200',
    medium: 'text-risk-medium bg-amber-50 border-amber-200',
    high: 'text-risk-high bg-red-50 border-red-200'
  };
  return colors[level] || colors.low;
}

/**
 * Get risk emoji based on level
 * @param {string} level - Risk level (low/medium/high)
 * @returns {string} Emoji
 */
export function getRiskEmoji(level) {
  const emojis = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  return emojis[level] || emojis.low;
}
