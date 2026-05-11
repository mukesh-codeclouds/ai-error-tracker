/**
 * Client-side format hint — reads first 30 lines of a File object
 * and returns a best-guess format string or null.
 * The server always does authoritative detection; this just pre-fills the badge.
 *
 * @param {File} file
 * @returns {Promise<'php'|'nodejs'|'python'|'unknown'>}
 */
export async function detectFormat(file) {
  try {
    const slice = file.slice(0, 8192) // first 8 KB
    const text = await slice.text()
    const lines = text.split('\n').slice(0, 30).join('\n')

    const scores = { php: 0, nodejs: 0, python: 0 }

    if (/PHP (Fatal|Warning|Parse|Notice|Deprecated) error:/i.test(lines)) scores.php += 3
    if (/\[.*?\] PHP/i.test(lines)) scores.php += 2
    if (/Uncaught .+ in .+\.php/i.test(lines)) scores.php += 2

    if (/UnhandledPromiseRejection/i.test(lines)) scores.nodejs += 3
    if (/at Object\.|at Module\.|at Function\./i.test(lines)) scores.nodejs += 2
    if (/TypeError:|ReferenceError:|SyntaxError:/i.test(lines)) scores.nodejs += 1

    if (/Traceback \(most recent call last\)/i.test(lines)) scores.python += 3
    if (/File ".+", line \d+/i.test(lines)) scores.python += 2
    if (/ModuleNotFoundError:|ImportError:|ValueError:/i.test(lines)) scores.python += 2

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    return best[1] > 0 ? best[0] : 'unknown'
  } catch {
    return 'unknown'
  }
}
