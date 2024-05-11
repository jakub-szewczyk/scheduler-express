import 'dotenv/config'
import app from './app'
import { registerNotifications } from './modules/pushSubscription'
import swaggerRoutes from './routes/swagger'

const PORT = process.env.PORT

app.use('/api-docs', swaggerRoutes)

// Main
;(async () => {
  console.log(`⚡️[server]: registering push notifications...`)
  await registerNotifications()
  app.listen(PORT, () =>
    console.log(`⚡️[server]: running at http://localhost:${PORT}`)
  )
})()
