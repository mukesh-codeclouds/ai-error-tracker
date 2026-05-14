import { v4 as uuidv4 } from 'uuid'

// ── State machine states ──────────────────────────────────────
const IDLE = 'IDLE'
const IN_TRACEBACK = 'IN_TRACEBACK'

// Traceback start
const TRACEBACK_START_RE = /Traceback \(most recent call last\):/

// Frame inside traceback: '  File "path", line N, in fn'
const FRAME_RE = /^\s+File\s+"(.+?)",\s+line\s+(\d+),\s+in\s+(.+)/

// Error conclusion line (after traceback frames)
const ERROR_PATTERNS = [
  { re: /^SyntaxError:\s*(.+)/,         errorType: 'SyntaxError',        severity: 'critical' },
  { re: /^IndentationError:\s*(.+)/,    errorType: 'IndentationError',   severity: 'critical' },
  { re: /^ImportError:\s*(.+)/,         errorType: 'ImportError',        severity: 'high' },
  { re: /^ModuleNotFoundError:\s*(.+)/, errorType: 'ModuleNotFoundError',severity: 'high' },
  { re: /^RuntimeError:\s*(.+)/,        errorType: 'RuntimeError',       severity: 'high' },
  { re: /^AttributeError:\s*(.+)/,      errorType: 'AttributeError',     severity: 'high' },
  { re: /^TypeError:\s*(.+)/,           errorType: 'TypeError',          severity: 'high' },
  { re: /^NameError:\s*(.+)/,           errorType: 'NameError',          severity: 'high' },
  { re: /^ValueError:\s*(.+)/,          errorType: 'ValueError',         severity: 'medium' },
  { re: /^Exception:\s*(.+)/,           errorType: 'Exception',          severity: 'medium' },
  { re: /^OSError:\s*(.+)/,             errorType: 'OSError',            severity: 'medium' },
  { re: /^KeyError:\s*(.+)/,            errorType: 'KeyError',           severity: 'low' },
  { re: /^IndexError:\s*(.+)/,          errorType: 'IndexError',         severity: 'low' },
  { re: /^StopIteration:\s*(.+)/,       errorType: 'StopIteration',      severity: 'low' },
  // Generic fallback: "XxxError: message"
  { re: /^(\w+Error|\w+Exception):\s*(.+)/, errorType: 'GenericException', severity: 'medium' },
]

// Standalone errors (no traceback) — e.g. from scripts
const STANDALONE_PATTERNS = ERROR_PATTERNS

/**
 * Returns a stateful line processor for Python logs.
 */
export function createPythonParser() {
  const errors = []
  let state = IDLE
  let frames = []

  return {
    processLine: (rawLine) => {
      const line = rawLine.trim()
      if (!line) return

      if (state === IDLE) {
        if (TRACEBACK_START_RE.test(line)) {
          state = IN_TRACEBACK
          frames = []
          return
        }

        // Standalone error line (no traceback)
        for (const { re, errorType, severity } of STANDALONE_PATTERNS) {
          const m = re.exec(line)
          if (m) {
            errors.push({
              id:          `err_${uuidv4().slice(0, 8)}`,
              timestamp:   null,
              language:    'python',
              errorType,
              severity,
              message:     (m[2] ?? m[1]).trim(),
              file:        null,
              line:        null,
              rawLine:     rawLine,
              stackFrames: [],
            })
            break
          }
        }
      } else if (state === IN_TRACEBACK) {
        const frameMatch = FRAME_RE.exec(rawLine.trimEnd())
        if (frameMatch) {
          frames.push({
            file: frameMatch[1],
            line: parseInt(frameMatch[2], 10),
            fn:   frameMatch[3],
            raw:  rawLine,
          })
          return
        }

        // Try to match as error conclusion
        let matched = false
        for (const { re, errorType, severity } of ERROR_PATTERNS) {
          const m = re.exec(line)
          if (m) {
            const lastFrame = frames[frames.length - 1]
            errors.push({
              id:          `err_${uuidv4().slice(0, 8)}`,
              timestamp:   null,
              language:    'python',
              errorType,
              severity,
              message:     (m[2] ?? m[1]).trim(),
              file:        lastFrame?.file ?? null,
              line:        lastFrame?.line ?? null,
              rawLine:     rawLine,
              stackFrames: frames.map((f) => `File "${f.file}", line ${f.line}, in ${f.fn}`),
            })
            matched = true
            state = IDLE
            frames = []
            break
          }
        }

        if (!matched && !frameMatch) {
          // If the line is NOT indented and doesn't match an error, then we abandon.
          if (!rawLine.startsWith(' ') && !rawLine.startsWith('\t')) {
            state = IDLE
            frames = []
          }
        }
      }
    },
    getResults: () => errors
  }
}

/**
 * Legacy support for whole-content parsing
 */
export function parsePython(content) {
  const parser = createPythonParser()
  content.split('\n').forEach(parser.processLine)
  return parser.getResults()
}
