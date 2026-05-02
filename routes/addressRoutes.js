import express from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from '../controllers/addressController.js'

const router = express.Router()

router.use(authMiddleware)

router.post(
  '/',
  body('fullAddress').notEmpty().withMessage('fullAddress is required'),
  body('city').notEmpty().withMessage('city is required'),
  body('pincode').notEmpty().withMessage('pincode is required'),
  body('country').notEmpty().withMessage('country is required'),
  validateRequest,
  addAddress
)
router.get('/', getAddresses)
router.patch(
  '/:id',
  body('fullAddress').optional().notEmpty().withMessage('fullAddress cannot be empty'),
  body('city').optional().notEmpty().withMessage('city cannot be empty'),
  body('pincode').optional().notEmpty().withMessage('pincode cannot be empty'),
  body('country').optional().notEmpty().withMessage('country cannot be empty'),
  validateRequest,
  updateAddress
)
router.delete('/:id', deleteAddress)

export default router
