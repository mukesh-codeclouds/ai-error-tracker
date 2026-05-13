/**
 * Matches a log-provided absolute or partial path against a local codebase index.
 * 
 * @param {string} logPath - The path from the log file (e.g. "/var/www/html/app/Models/User.php")
 * @param {Object} fileIndex - The index from useCodebaseStore (filename -> array of relative paths)
 * @returns {string|null} - The best matching relative path in the local codebase, or null.
 */
export function matchLogPathToLocal(logPath, fileIndex) {
  if (!logPath || !fileIndex) return null;

  // 1. Normalize path separators
  const normalizedLogPath = logPath.replace(/\\/g, '/');
  const parts = normalizedLogPath.split('/');
  const fileName = parts[parts.length - 1];

  // 2. Check if filename exists in index
  const candidates = fileIndex[fileName];
  if (!candidates || candidates.length === 0) return null;

  // 3. If only one candidate, return it
  if (candidates.length === 1) return candidates[0];

  // 4. If multiple candidates, try to find the best match by comparing path segments from right to left
  let bestMatch = candidates[0];
  let maxMatchLength = 0;

  for (const candidate of candidates) {
    const candidateParts = candidate.split('/');
    let matchLength = 0;
    
    // Compare segments from right to left (starting from the filename)
    for (let i = 1; i <= Math.min(parts.length, candidateParts.length); i++) {
      if (parts[parts.length - i] === candidateParts[candidateParts.length - i]) {
        matchLength++;
      } else {
        break;
      }
    }

    if (matchLength > maxMatchLength) {
      maxMatchLength = matchLength;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}
