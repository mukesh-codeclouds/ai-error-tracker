import { v4 as uuidv4 } from 'uuid'

// PM2 prefix: "2026-05-07 14:23:11: "
const PM2_PREFIX_RE = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}:\s/

// Stack frame: "    at Object.<anonymous> (/app/index.js:10:5)"
const STACK_FRAME_RE = /^\s+at\s+.+/

// ── Pattern table ─────────────────────────────────────────────
const PATTERNS = [
  {
    re: /UnhandledPromiseRejectionWarning:\s*(.+)/,
    errorType: 'UnhandledPromiseRejection',
    severity: 'critical',
  },
  {
    re: /TypeError:\s*(.+)/,
    errorType: 'TypeError',
    severity: 'high',
  },
  {
    re: /ReferenceError:\s*(.+)/,
    errorType: 'ReferenceError',
    severity: 'high',
  },
  {
    re: /SyntaxError:\s*(.+)/,
    errorType: 'SyntaxError',
    severity: 'high',
  },
  {
    re: /RangeError:\s*(.+)/,
    errorType: 'RangeError',
    severity: 'high',
  },
  {
    re: /(?:Error|Exception):\s*(.+)/,
    errorType: 'Error',
    severity: 'medium',
  },
]

// Full stack frame regex for file/line/col extraction
const FRAME_DETAIL_RE = /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/

/**
 * Returns a stateful line processor for Node.js logs.
 */
export function createNodejsParser() {
  const errors = []
  let currentError = null

  return {
    processLine: (rawLine) => {
      // Strip PM2 prefix
      const lineWithoutPrefix = rawLine.replace(PM2_PREFIX_RE, '')
      const line = lineWithoutPrefix.trim()
      if (!line) return

      // Stack frame — attach to current error
      if (STACK_FRAME_RE.test(lineWithoutPrefix) && currentError) {
        const fm = FRAME_DETAIL_RE.exec(lineWithoutPrefix)
        currentError.stackFrames = currentError.stackFrames || []
        if (fm) {
          currentError.stackFrames.push(`at ${fm[1]} (${fm[2]}:${fm[3]}:${fm[4]})`)
          // Use first stack frame for file + line if not set
          if (!currentError.file) {
            currentError.file = fm[2]
            currentError.line = parseInt(fm[3], 10)
          }
        } else {
          currentError.stackFrames.push(line.trim())
        }
        return
      }

      // Try each error pattern
      let matched = false
      for (const { re, errorType, severity } of PATTERNS) {
        const m = re.exec(line)
        if (m) {
          currentError = {
            id:          `err_${uuidv4().slice(0, 8)}`,
            timestamp:   null, // Node.js stderr doesn't always have timestamps
            language:    'nodejs',
            errorType,
            severity,
            message:     m[1].trim(),
            file:        null,
            line:        null,
            rawLine:     rawLine,
            stackFrames: [],
          }
          errors.push(currentError)
          matched = true
          break
        }
      }

      if (!matched && !STACK_FRAME_RE.test(line)) {
        currentError = null
      }
    },
    getResults: () => errors
  }
}

/**
 * Legacy support for whole-content parsing
 */
export function parseNodejs(content) {
  const parser = createNodejsParser()
  content.split('\n').forEach(parser.processLine)
  return parser.getResults()
}
