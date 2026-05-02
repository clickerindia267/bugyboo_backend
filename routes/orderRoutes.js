import express from 'express'
import { body } from 'express-validator'
import { getOrders, getPendingOrders, updateOrderStatus } from '../controllers/orderController.js'
import { validateRequest } from '../middleware/validateRequest.js'

const router = express.Router()

router.get('/', getOrders)
router.get('/pending', getPendingOrders)
router.patch(
  '/:id/status',
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'declined'])
    .withMessage('Status must be approved or declined'),
  validateRequest,
  updateOrderStatus
)

export default router
