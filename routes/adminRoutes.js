import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { adminRateLimiter } from '../middleware/rateLimiter.js'
import { getAdminDashboard, getRevenueAnalytics } from '../controllers/adminController.js'
import productRoutes from './productRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import orderRoutes from './orderRoutes.js'
import { adminBlogRouter } from './blogRoutes.js'

const router = express.Router()

router.use(authMiddleware, adminMiddleware, adminRateLimiter)

router.get('/dashboard', getAdminDashboard)
router.get('/revenue', getRevenueAnalytics)
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/orders', orderRoutes)
router.use('/blogs', adminBlogRouter)

export default router
