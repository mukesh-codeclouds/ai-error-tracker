import zlib from 'zlib'
import path from 'path'

/**
 * Decompresses a multer file buffer if .gz, otherwise returns UTF-8 string.
 * @param {Express.Multer.File} file
 * @returns {Promise<string>} plain text content
 */
export async function decompress(file) {
  const ext = path.extname(file.originalname).toLowerCase()

  if (ext === '.gz') {
    return new Promise((resolve, reject) => {
      zlib.gunzip(file.buffer, (err, result) => {
        if (err) {
          reject(new Error(`Failed to decompress ${file.originalname}: ${err.message}`))
        } else {
          resolve(result.toString('utf8'))
        }
      })
    })
  }

  // Plain text file
  const text = file.buffer.toString('utf8')

  // Sanity check — reject binary-looking content
  const nullBytes = (text.match(/\x00/g) || []).length
  if (nullBytes > text.length * 0.01) {
    throw new Error(`${file.originalname} appears to be a binary file, not a text log.`)
  }

  return text
}
