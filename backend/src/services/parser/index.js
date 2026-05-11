import { parsePhp } from './php.parser.js'
import { parseNodejs } from './nodejs.parser.js'
import { parsePython } from './python.parser.js'

const PARSERS = {
  php:    parsePhp,
  nodejs: parseNodejs,
  python: parsePython,
}

/**
 * Dispatch log content to the correct parser.
 * @param {string} content
 * @param {string} format
 * @returns {import('./types.js').ParsedError[]}
 */
export function dispatch(content, format) {
  const parser = PARSERS[format]
  if (!parser) return []
  return parser(content)
}
