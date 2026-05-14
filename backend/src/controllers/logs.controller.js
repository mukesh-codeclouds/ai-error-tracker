import { v4 as uuidv4 } from 'uuid'
import { handleUpload } from '../middleware/upload.middleware.js'
import { getChunk, getStream } from '../services/decompressor.service.js'
import { detectFormat } from '../services/formatDetector.service.js'
import { parseStream } from '../services/parser/index.js'

export async function uploadLogs(req, res, next) {
  try {
    // 1. Handle multipart upload (files saved to disk by multer)
    await handleUpload(req, res)

    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files attached. Please upload at least one log file.' })
    }

    const formatOverride = req.body.formatOverride || null
    const sessionId = uuidv4()
    const results = []

    for (const file of req.files) {
      const startTime = Date.now()

      // 2. Detect format using a small chunk (efficient for large files)
      let detectedFormat = formatOverride
      if (!detectedFormat) {
        try {
          const chunk = await getChunk(file.path)
          detectedFormat = detectFormat(chunk)
        } catch (err) {
          console.error(`Detection error for ${file.originalname}:`, err)
          detectedFormat = 'unknown'
        }
      }

      const overrideApplied = !!formatOverride

      if (detectedFormat === 'unknown') {
        results.push({
          fileName: file.originalname,
          originalSize: file.size,
          detectedFormat: 'unknown',
          overrideApplied: false,
          parseTimeMs: Date.now() - startTime,
          errors: [],
          summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
          warning: 'Could not detect log format. Please use the format override.',
        })
        continue
      }

      // 3. Parse stream (line-by-line)
      let errors = []
      try {
        const stream = getStream(file.path)
        errors = await parseStream(stream, detectedFormat)
      } catch (err) {
        console.error(`Parsing error for ${file.originalname}:`, err)
        // We could return a partial result or an error for this specific file
      }

      // 4. Summary counts
      const summary = { total: errors.length, critical: 0, high: 0, medium: 0, low: 0 }
      for (const e of errors) {
        if (summary[e.severity] !== undefined) summary[e.severity]++
      }

      results.push({
        fileName: file.originalname,
        originalSize: file.size,
        detectedFormat,
        overrideApplied,
        parseTimeMs: Date.now() - startTime,
        errors,
        summary,
      })
    }

    return res.status(200).json({ sessionId, files: results })
  } catch (err) {
    next(err)
  }
}
