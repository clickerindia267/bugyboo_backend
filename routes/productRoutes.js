import express from 'express'
import multer from 'multer'
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

const router = express.Router()
const formParser = multer().none()

router.get('/', getProducts)

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
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('basePrice').isFloat({ gt: 0 }).withMessage('Base price must be greater than zero'),
  body('sellPrice').isFloat({ gt: 0 }).withMessage('Sell price must be greater than zero'),
  body('gst').isFloat({ min: 0 }).withMessage('GST must be a number'),
  validateRequest,
  createProduct
)

router.patch(
  '/:id',
  formParser,
  body('basePrice').optional().isFloat({ gt: 0 }).withMessage('Base price must be greater than zero'),
  body('sellPrice').optional().isFloat({ gt: 0 }).withMessage('Sell price must be greater than zero'),
  body('gst').optional().isFloat({ min: 0 }).withMessage('GST must be a number'),
  validateRequest,
  updateProduct
)

router.delete('/:id', deleteProduct)
router.patch('/:id/pause', pauseProduct)

export default router
