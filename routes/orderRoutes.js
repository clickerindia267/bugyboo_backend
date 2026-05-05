import express from 'express'
import { body } from 'express-validator'
import { getOrders, getPendingOrders, getDeliveredOrders, updateOrderStatus } from '../controllers/orderController.js'
import { validateRequest } from '../middleware/validateRequest.js'

const router = express.Router()

router.get('/', getOrders)
router.get('/pending', getPendingOrders)
router.get('/delivered', getDeliveredOrders)
router.patch(
  '/:id/status',
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'shipped', 'cancelled', 'out_for_delivery', 'delivered'])
    .withMessage('Status must be one of: approved, shipped, cancelled, out_for_delivery, delivered'),
  validateRequest,
  updateOrderStatus
)

export default router
