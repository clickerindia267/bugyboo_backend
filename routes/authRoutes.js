import express from 'express'
import {
  signup,
  login,
  refreshToken,
  logout,
  getProfile
} from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/signup', authRateLimiter, signup)
router.post('/login', authRateLimiter, login)
router.post('/refresh-token', authRateLimiter, refreshToken)
router.post('/logout', authRateLimiter, logout)
router.get('/me', authMiddleware, getProfile)

export default router
