import express from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
  placeOrder,
  getUserOrders,
  getUserOrderById,
  cancelOrder
} from '../controllers/orderController.js'

const router = express.Router()

router.use(authMiddleware)

router.post(
  '/',
  body('contact.name').notEmpty().withMessage('Contact name is required'),
  body('contact.mobile').notEmpty().withMessage('Contact mobile is required'),
  body('addressId').notEmpty().withMessage('addressId is required'),
  body('paymentMethod').equals('COD').withMessage('Only COD is supported'),
  validateRequest,
  placeOrder
)
router.get('/', getUserOrders)
router.get('/:id', getUserOrderById)
router.patch('/:id/cancel', cancelOrder)

export default router
