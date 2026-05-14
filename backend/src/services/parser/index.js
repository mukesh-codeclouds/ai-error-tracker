import readline from 'readline'
import { parsePhp, createPhpParser } from './php.parser.js'
import { parseNodejs, createNodejsParser } from './nodejs.parser.js'
import { parsePython, createPythonParser } from './python.parser.js'

const PARSERS = {
  php:    parsePhp,
  nodejs: parseNodejs,
  python: parsePython,
}

const STREAM_PARSERS = {
  php:    createPhpParser,
  nodejs: createNodejsParser,
  python: createPythonParser,
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

/**
 * Parses a stream line-by-line using the specified format.
 * @param {import('stream').Readable} stream
 * @param {string} format
 * @returns {Promise<import('./types.js').ParsedError[]>}
 */
export async function parseStream(stream, format) {
  const createParser = STREAM_PARSERS[format]
  if (!createParser) return []

  const parser = createParser()
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    parser.processLine(line)
  }

  return parser.getResults()
}
