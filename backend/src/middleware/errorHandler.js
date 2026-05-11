import { config } from '../config/index.js'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500
  const message = err.message ?? 'Internal server error'

  if (config.nodeEnv !== 'production') {
    console.error(`[ERROR ${status}] ${message}`)
  }

  res.status(status).json({ error: message })
}
