import multer from 'multer'
import path from 'path'
import { config } from '../config/index.js'

const MAX_SIZE = config.maxFileSizeMB * 1024 * 1024

const storage = multer.memoryStorage()

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase()
  if (config.allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    const err = new Error(`Unsupported file type: ${ext}. Allowed: ${config.allowedExtensions.join(', ')}`)
    err.status = 400
    cb(err, false)
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).array('files', 20)

/**
 * Wraps multer in a promise so controller can use async/await.
 */
export function handleUpload(req, res) {
  return new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const e = new Error(`File exceeds ${config.maxFileSizeMB} MB size limit`)
          e.status = 413
          reject(e)
        } else {
          const e = new Error(err.message)
          e.status = 400
          reject(e)
        }
      } else if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
