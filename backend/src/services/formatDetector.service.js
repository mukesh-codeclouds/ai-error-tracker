/**
 * Scoring-based log format detector.
 * Scans the first 50 lines for signature patterns.
 *
 * @param {string} content
 * @returns {'php' | 'nodejs' | 'python' | 'unknown'}
 */
export function detectFormat(content) {
  const lines = content.split('\n').slice(0, 50).join('\n')
  const scores = { php: 0, nodejs: 0, python: 0 }

  // ── PHP signatures ───────────────────────────────────────────
  if (/\[.*?\]\s*PHP (Fatal error|Parse error|Warning|Notice|Deprecated)/i.test(lines)) scores.php += 3
  if (/local\.(ERROR|WARNING|INFO|DEBUG|CRITICAL):/i.test(lines)) scores.php += 3
  if (/\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\]\s+\w+\.(ERROR|WARNING|INFO|DEBUG|CRITICAL):/i.test(lines)) scores.php += 5
  if (/PHP Fatal error:/i.test(lines))   scores.php += 2
  if (/PHP Warning:/i.test(lines))       scores.php += 1
  if (/PHP Notice:/i.test(lines))        scores.php += 1
  if (/Uncaught .+ in .+\.php/i.test(lines)) scores.php += 2
  if (/Stack trace:/i.test(lines))       scores.php += 1

  // ── Node.js signatures ───────────────────────────────────────
  if (/UnhandledPromiseRejectionWarning/i.test(lines)) scores.nodejs += 3
  if (/at Object\.<anonymous>/i.test(lines))           scores.nodejs += 2
  if (/at Module\._resolveFilename/i.test(lines))      scores.nodejs += 2
  if (/TypeError:|ReferenceError:/i.test(lines))       scores.nodejs += 1
  if (/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}:\s/i.test(lines)) scores.nodejs += 1 // PM2 prefix

  // ── Python signatures ────────────────────────────────────────
  if (/Traceback \(most recent call last\)/i.test(lines)) scores.python += 3
  if (/File ".+", line \d+, in /i.test(lines))            scores.python += 2
  if (/ModuleNotFoundError:|ImportError:/i.test(lines))   scores.python += 2
  if (/ValueError:|RuntimeError:|AttributeError:/i.test(lines)) scores.python += 1
  if (/SyntaxError:/i.test(lines))                        scores.python += 1

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best[1] > 0 ? best[0] : 'unknown'
}
