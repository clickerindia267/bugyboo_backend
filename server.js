import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import productPublicRoutes from './routes/productPublicRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import userOrderRoutes from './routes/userOrderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { blogRouter } from './routes/blogRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

const corsOptions = {
  origin: ['https://bugyboo.com', 'https://www.bugyboo.com' , 'http://localhost:8080'],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/products', productPublicRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/address', addressRoutes)
app.use('/api/orders', userOrderRoutes)
app.use('/api/user', userRoutes)
app.use('/api/blogs', blogRouter)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server failed to start:', error)
    process.exit(1)
  }
}

startServer()
