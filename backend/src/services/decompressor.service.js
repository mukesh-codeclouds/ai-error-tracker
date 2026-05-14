import zlib from 'zlib'
import path from 'path'
import fs from 'fs'

/**
 * Creates a readable stream for a file, decompressing if .gz.
 * @param {string} filePath
 * @returns {import('stream').Readable}
 */
export function getStream(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const readStream = fs.createReadStream(filePath)

  if (ext === '.gz') {
    return readStream.pipe(zlib.createGunzip())
  }

  return readStream
}

/**
 * Reads the first chunk of a file (decompressed if .gz) for format detection.
 * @param {string} filePath
 * @param {number} size
 * @returns {Promise<string>}
 */
export async function getChunk(filePath, size = 8192) {
  const stream = getStream(filePath)
  
  return new Promise((resolve, reject) => {
    let chunk = Buffer.alloc(0)
    
    stream.on('data', (data) => {
      chunk = Buffer.concat([chunk, data])
      if (chunk.length >= size) {
        stream.destroy() // Stop reading
        resolve(chunk.toString('utf8', 0, size))
      }
    })

    stream.on('end', () => {
      resolve(chunk.toString('utf8'))
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Legacy support for whole-content parsing (not recommended for large files)
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function decompress(filePath) {
  const stream = getStream(filePath)
  return new Promise((resolve, reject) => {
    let content = ''
    stream.on('data', (data) => content += data.toString('utf8'))
    stream.on('end', () => resolve(content))
    stream.on('error', reject)
  })
}
