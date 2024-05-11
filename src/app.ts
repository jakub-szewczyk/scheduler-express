import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import apiRoutes from './routes/routes'

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use('/api', ClerkExpressRequireAuth(), apiRoutes)

export default app
