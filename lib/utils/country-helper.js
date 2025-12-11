
// Words to ignore during fuzzy match (Noise reduction)
const STOP_WORDS = new Set([
  "the", "republic", "of", "kingdom", "democratic", "people's", 
  "peoples", "islamic", "arab", "state", "federated", "union", 
  "islands", "island", "saint", "st", "and", "&"
]);

/**
 * Normalize text: lowercase, remove punctuation, collapse spaces.
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\(\)\.,'-]/g, " ") // Remove brackets, dots, commas, dashes
    .replace(/\s+/g, " ")         // Collapse spaces
    .trim();
}

/**
 * Filter out stop words from token set
 */
function getSignificantTokens(text) {
  const tokens = normalize(text).split(" ");
  const significant = new Set();
  tokens.forEach(t => {
    if (t.length > 1 && !STOP_WORDS.has(t)) {
      significant.add(t);
    }
  });
  return significant;
}

/**
 * Compute Jaccard Similarity (Intersection / Union)
 */
function scoreMatch(input, target) {
  const inputTokens = getSignificantTokens(input);
  const targetTokens = getSignificantTokens(target);

  if (inputTokens.size === 0 || targetTokens.size === 0) return 0;

  let intersection = 0;
  inputTokens.forEach((t) => {
    if (targetTokens.has(t)) intersection++;
  });

  const union = new Set([...inputTokens, ...targetTokens]).size;
  return intersection / union;
}

/**
 * Find the best matching key from a list of options
 * @param {string} inputName - The country name we are looking for (e.g. "Sri Lanka")
 * @param {string[]} options - The list of available names from the website
 */
export function findBestMatch(inputName, options) {
  const cleanInput = normalize(inputName);
  let bestMatch = null;
  let bestScore = 0;

  for (const option of options) {
    // 1. Exact Match (Fastest)
    if (cleanInput === normalize(option)) return option;

    // 2. Fuzzy Match
    const score = scoreMatch(cleanInput, option);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = option;
    }
  }

  // Threshold: 0.4 allows "USA" -> "United States" or "Bahamas" -> "The Bahamas"
  // console.log(`Matching "${inputName}": Found "${bestMatch}" (Score: ${bestScore})`);
  
  if (bestScore >= 0.4) return bestMatch;
  return null;
}