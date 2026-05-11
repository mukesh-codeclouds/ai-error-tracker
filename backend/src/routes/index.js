import { Router } from 'express'
import logsRouter from './logs.route.js'

const router = Router()

router.use('/logs', logsRouter)

export default router
