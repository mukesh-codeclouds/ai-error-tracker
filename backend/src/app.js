import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({ origin: config.corsOrigin, credentials: true }))

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', phase: 1 }))

// ── API routes ────────────────────────────────────────────────
app.use('/api', routes)

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler)

export default app
