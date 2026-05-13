import express from 'express'
import paymentRoutes from './routes/paymentRoutes.js'

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/api/payment', paymentRoutes)

export default app
