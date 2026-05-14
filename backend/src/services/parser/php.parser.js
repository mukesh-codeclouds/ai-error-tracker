import { v4 as uuidv4 } from 'uuid'

// ── Timestamp parser ─────────────────────────────────────────
// Support both formats:
// [07-May-2026 14:23:11 UTC]
// [2026-04-29 10:47:25]
const TS_RE = /\[(\d{2}-\w{3}-\d{4}\s\d{2}:\d{2}:\d{2}(?:\s\w+)?|\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]/

function parseTimestamp(raw) {
  try {
    // Handle standard format if needed, but Date() usually works
    return new Date(raw).toISOString()
  } catch {
    return null
  }
}

function extractTimestamp(line) {
  const m = TS_RE.exec(line)
  return m ? parseTimestamp(m[1]) : null
}

// ── Pattern table ─────────────────────────────────────────────
const PATTERNS = [
  // Laravel-style: [2026-04-29 13:32:47] local.ERROR: Message
  {
    re: /^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+\w+\.(ERROR|CRITICAL|ALERT|EMERGENCY):\s*(.+)/,
    errorType: 'Laravel Error',
    severity: 'critical',
    map: (m) => ({ message: m[3], timestamp: m[1] })
  },
  {
    re: /^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+\w+\.(WARNING):\s*(.+)/,
    errorType: 'Laravel Warning',
    severity: 'high',
    map: (m) => ({ message: m[3], timestamp: m[1] })
  },
  {
    re: /^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+\w+\.(NOTICE|INFO|DEBUG):\s*(.+)/,
    errorType: 'Laravel Log',
    severity: 'low',
    map: (m) => ({ message: m[3], timestamp: m[1] })
  },
  // Standard PHP Fatal Errors
  {
    re: /^\[(.*?)\]\s*PHP Fatal error:\s*Uncaught (.+?) in (.+?):(\d+)/,
    errorType: 'Uncaught Exception',
    severity: 'high',
    map: (m) => ({ message: m[2], file: m[3], line: m[4] })
  },
  {
    re: /^\[(.*?)\]\s*PHP Fatal error:\s*(.+?) in (.+?) on line (\d+)/,
    errorType: 'Fatal Error',
    severity: 'critical',
    map: (m) => ({ message: m[2], file: m[3], line: m[4] })
  },
  {
    re: /^\[(.*?)\]\s*PHP Parse error:\s*(.+?) in (.+?) on line (\d+)/,
    errorType: 'Parse Error',
    severity: 'critical',
    map: (m) => ({ message: m[2], file: m[3], line: m[4] })
  },
  {
    re: /^\[(.*?)\]\s*PHP (?:Warning|Notice|Deprecated):\s*(.+?) in (.+?) on line (\d+)/,
    errorType: 'Runtime Error',
    severity: 'medium',
    map: (m) => ({ message: m[2], file: m[3], line: m[4] })
  },
]

// Stack trace line patterns
const STACK_FRAME_RE = /^(?:#\d+|\[stacktrace\]|\s+at\s+.+|\s+"?#\d+)/

// Regex to extract file/line from Laravel message: "at C:/path/to/file.php:42"
const FILE_LINE_RE = /at\s+(.+?):(\d+)/

/**
 * Returns a stateful line processor for PHP logs.
 */
export function createPhpParser() {
  const errors = []
  let currentError = null

  return {
    processLine: (rawLine) => {
      const line = rawLine.trim()
      if (!line) return

      // Stack trace line — attach to current error
      if (STACK_FRAME_RE.test(line) && currentError) {
        currentError.stackFrames = currentError.stackFrames || []
        currentError.stackFrames.push(line)
        return
      }

      // Try each pattern
      let matched = false
      for (const { re, errorType, severity, map } of PATTERNS) {
        const m = re.exec(line)
        if (m) {
          const data = map(m)
          let file = data.file?.trim() ?? null
          let lineNum = data.line ? parseInt(data.line, 10) : null

          // Try extracting from message if null (common in Laravel FatalErrors)
          if (!file && data.message) {
            const flm = FILE_LINE_RE.exec(data.message)
            if (flm) {
              file = flm[1]
              lineNum = parseInt(flm[2], 10)
            }
          }

          currentError = {
            id:          `err_${uuidv4().slice(0, 8)}`,
            timestamp:   data.timestamp ? parseTimestamp(data.timestamp) : extractTimestamp(line),
            language:    'php',
            errorType,
            severity,
            message:     data.message.trim(),
            file,
            line:        lineNum,
            rawLine:     rawLine,
            stackFrames: [],
          }
          errors.push(currentError)
          matched = true
          break
        }
      }

      if (!matched) {
        // Reset stack trace grouping if a non-matching, non-stack line appears
        if (!STACK_FRAME_RE.test(line)) {
          currentError = null
        }
      }
    },
    getResults: () => errors
  }
}

/**
 * Legacy support for whole-content parsing
 */
export function parsePhp(content) {
  const parser = createPhpParser()
  content.split('\n').forEach(parser.processLine)
  return parser.getResults()
}
