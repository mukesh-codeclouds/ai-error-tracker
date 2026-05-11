import { Router } from 'express'
import { uploadLogs } from '../controllers/logs.controller.js'

const router = Router()

// POST /api/logs/upload
router.post('/upload', uploadLogs)

export default router
