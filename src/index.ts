import dotenv from 'dotenv'
import express from 'express'
import routes from './routes/routes'
import cors from 'cors'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

dotenv.config()

const app = express()

app.use(cors())

const PORT = process.env.PORT

app.use('/api', ClerkExpressRequireAuth(), routes)

app.listen(PORT, () =>
  console.log(`⚡️[server]: running at http://localhost:${PORT}`)
)
