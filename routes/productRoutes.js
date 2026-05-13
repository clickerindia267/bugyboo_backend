import express from 'express'
import { body } from 'express-validator'
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  pauseProduct
} from '../controllers/productController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { adminMediaUpload } from '../middleware/upload.js'
import { parseVariants } from '../middleware/parseVariants.js'

const router = express.Router()

router.get('/', getProducts)

// Custom validator for variants
const validateVariants = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Variants must be a non-empty array')
  }

  for (const variant of value) {
    if (!variant.ageGroup || typeof variant.ageGroup !== 'string' || !variant.ageGroup.trim()) {
      throw new Error('Age group is required')
    }
    if (variant.basePrice == null) {
      throw new Error(`Base price is required for age group ${variant.ageGroup}`)
    }
    if (variant.sellPrice == null) {
      throw new Error(`Sell price is required for age group ${variant.ageGroup}`)
    }
    if (typeof variant.basePrice !== 'number' || variant.basePrice < 0) {
      throw new Error(`Invalid basePrice for age group ${variant.ageGroup}`)
    }
    if (typeof variant.sellPrice !== 'number' || variant.sellPrice < 0) {
      throw new Error(`Invalid sellPrice for age group ${variant.ageGroup}`)
    }
  }
  
  return true
}

router.post(
  '/',
  (req, res, next) => {
    adminMediaUpload(4, 'admin')(req, res, err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }
      next()
    })
  },
  parseVariants,
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('variants').custom(validateVariants),
  body('gst').optional().isFloat({ min: 0 }).withMessage('GST must be a number'),
  validateRequest,
  createProduct
)

router.patch(
  '/:id',
  (req, res, next) => {
    adminMediaUpload(4, 'admin')(req, res, err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }
      next()
    })
  },
  parseVariants,
  body('variants').optional().custom(validateVariants),
  body('gst').optional().isFloat({ min: 0 }).withMessage('GST must be a number'),
  validateRequest,
  updateProduct
)

router.delete('/:id', deleteProduct)
router.patch('/:id/pause', pauseProduct)

export default router
