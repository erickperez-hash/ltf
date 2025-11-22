/**
 * Common real estate red flag phrases and their translations
 */
export const RED_FLAG_DICTIONARY = {
  'cozy': 'Very small',
  'charming': 'Old, needs updates',
  'fixer-upper': 'Major repairs needed',
  'fixer upper': 'Major repairs needed',
  'up-and-coming': 'Currently less desirable area',
  'up and coming': 'Currently less desirable area',
  'vintage charm': 'Outdated, no renovations',
  'needs tlc': 'Serious problems',
  'needs some tlc': 'Serious problems',
  'investment opportunity': 'Uninhabitable or major work needed',
  'as-is': "Seller won't fix anything",
  'as is': "Seller won't fix anything",
  'handyman special': 'Needs extensive repairs',
  'bring your imagination': 'Major renovation required',
  'good bones': 'Everything else needs work',
  'unique': 'Strange layout or features',
  'intimate': 'Very small rooms',
  'efficient': 'Extremely small',
  'rustic': 'Old and worn',
  'classic': 'Outdated',
  'motivated seller': 'Desperate to sell (possible issues)',
  'priced to sell': 'Below market value (possible issues)',
  'convenient to': 'Not actually in desirable area'
};

/**
 * Check if phrase contains red flag keywords
 * @param {string} phrase - Phrase to check
 * @returns {Object|null} Red flag info or null
 */
export function checkRedFlag(phrase) {
  const lowerPhrase = phrase.toLowerCase();

  for (const [flag, translation] of Object.entries(RED_FLAG_DICTIONARY)) {
    if (lowerPhrase.includes(flag)) {
      return {
        phrase: flag,
        translation
      };
    }
  }

  return null;
}

/**
 * Extract all red flags from description
 * @param {string} description - Listing description
 * @returns {Array} Array of red flag objects
 */
export function extractRedFlags(description) {
  if (!description) return [];

  const flags = [];
  const sentences = description.split(/[.!?]+/);

  sentences.forEach(sentence => {
    const flag = checkRedFlag(sentence);
    if (flag && !flags.some(f => f.phrase === flag.phrase)) {
      flags.push(flag);
    }
  });

  return flags;
}
