import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import webpush from 'web-push'
import { schedulePushNotificationJobs } from './modules/notification'
import apiRoutes from './routes/routes'
import swaggerRoutes from './routes/swagger'

dotenv.config()

const PORT = process.env.PORT

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_SECRET_KEY!
)

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use('/api', ClerkExpressRequireAuth(), apiRoutes)

app.use('/api-docs', swaggerRoutes)

// Main
;(async () => {
  console.log(`⚡️[server]: rescheduling jobs...`)
  await schedulePushNotificationJobs()
  app.listen(PORT, async () =>
    console.log(`⚡️[server]: running at http://localhost:${PORT}`)
  )
})()
