import 'dotenv/config'
import app from './app'
import swaggerRoutes from './routes/swagger'
// import webpush from 'web-push'
// import { schedulePushNotificationJobs } from './modules/notification'

const PORT = process.env.PORT

// webpush.setVapidDetails(
//   process.env.VAPID_SUBJECT!,
//   process.env.VAPID_PUBLIC_KEY!,
//   process.env.VAPID_SECRET_KEY!
// )

app.use('/api-docs', swaggerRoutes)

// Main
;(async () => {
  console.log(`⚡️[server]: rescheduling jobs...`)
  // await schedulePushNotificationJobs()
  app.listen(PORT, () =>
    console.log(`⚡️[server]: running at http://localhost:${PORT}`)
  )
})()
