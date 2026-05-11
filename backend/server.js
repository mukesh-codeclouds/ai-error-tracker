import app from './src/app.js'
import { config } from './src/config/index.js'

app.listen(config.port, () => {
  console.log(`\n  🚀 TrackError API running at http://localhost:${config.port}`)
  console.log(`  📋 Health: http://localhost:${config.port}/health`)
  console.log(`  🌐 CORS origin: ${config.corsOrigin}\n`)
})
