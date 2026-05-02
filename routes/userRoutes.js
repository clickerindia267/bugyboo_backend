import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getUserDashboard } from '../controllers/userController.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/dashboard', getUserDashboard)

export default router
