import { v4 as uuidv4 } from 'uuid'
import { handleUpload } from '../middleware/upload.middleware.js'
import { decompress } from '../services/decompressor.service.js'
import { detectFormat } from '../services/formatDetector.service.js'
import { dispatch } from '../services/parser/index.js'

export async function uploadLogs(req, res, next) {
  try {
    // 1. Handle multipart upload
    await handleUpload(req, res)

    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files attached. Please upload at least one log file.' })
    }

    const formatOverride = req.body.formatOverride || null
    const sessionId = uuidv4()
    const results = []

    for (const file of req.files) {
      const startTime = Date.now()

      // 2. Decompress if .gz
      let content
      try {
        content = await decompress(file)
      } catch {
        return res.status(422).json({
          error: `File "${file.originalname}" could not be decompressed or read as text.`,
        })
      }

      // 3. Detect format
      const detectedFormat = formatOverride ?? detectFormat(content)
      const overrideApplied = !!formatOverride

      if (detectedFormat === 'unknown' && !formatOverride) {
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

      // 4. Parse
      const errors = dispatch(content, detectedFormat)

      // 5. Summary counts
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
