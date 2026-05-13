import express from 'express'
import { body, param } from 'express-validator'
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
  body('variantId').notEmpty().withMessage('variantId is required'),
  body('selectedAgeGroup')
    .isString().withMessage('selectedAgeGroup must be a string')
    .trim()
    .notEmpty().withMessage('selectedAgeGroup is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
  addToCart
)

router.get('/', getCart)

router.patch(
  '/update',
  body('productId').notEmpty().withMessage('productId is required'),
  body('variantId').notEmpty().withMessage('variantId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
  updateCart
)

router.delete(
  '/remove/:productId/:variantId',
  param('productId').notEmpty().withMessage('productId is required'),
  param('variantId').notEmpty().withMessage('variantId is required'),
  validateRequest,
  removeFromCart
)

router.delete('/clear', clearCart)

export default router
