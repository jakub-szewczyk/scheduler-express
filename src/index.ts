import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import routes from './routes/routes'

dotenv.config()

const PORT = process.env.PORT

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use('/api', ClerkExpressRequireAuth(), routes)

app.listen(PORT, () =>
  console.log(`⚡️[server]: running at http://localhost:${PORT}`)
)
