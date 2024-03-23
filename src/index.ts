import 'dotenv/config'
import webpush from 'web-push'
import app from './app'
import { schedulePushNotificationJobs } from './modules/notification'
import swaggerRoutes from './routes/swagger'

const PORT = process.env.PORT

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_SECRET_KEY!
)

app.use('/api-docs', swaggerRoutes)

// Main
;(async () => {
  console.log(`⚡️[server]: rescheduling jobs...`)
  await schedulePushNotificationJobs()
  app.listen(PORT, () =>
    console.log(`⚡️[server]: running at http://localhost:${PORT}`)
  )
})()
