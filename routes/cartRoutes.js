import express from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js'

const router = express.Router()

router.use(authMiddleware)

router.post(
  '/add',
  body('productId').notEmpty().withMessage('productId is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
  addToCart
)
router.get('/', getCart)
router.patch(
  '/update',
  body('productId').notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
  updateCart
)
router.delete('/remove/:productId', removeFromCart)
router.delete('/clear', clearCart)

export default router
