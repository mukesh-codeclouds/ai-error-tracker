import 'dotenv/config'

export const config = {
  port:               parseInt(process.env.PORT ?? '4000', 10),
  maxFileSizeMB:      parseInt(process.env.MAX_FILE_SIZE_MB ?? '500', 10),
  allowedExtensions:  (process.env.ALLOWED_EXTENSIONS ?? '.log,.txt,.gz').split(','),
  corsOrigin:         process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv:            process.env.NODE_ENV ?? 'development',
}
