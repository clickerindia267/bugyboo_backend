import express from 'express'
import { body } from 'express-validator'
import { createCategory, getCategories, deleteCategory } from '../controllers/categoryController.js'
import { validateRequest } from '../middleware/validateRequest.js'

const router = express.Router()

router.post(
  '/',
  body('name').notEmpty().withMessage('Category name is required'),
  validateRequest,
  createCategory
)

router.get('/', getCategories)
router.delete('/:id', deleteCategory)

export default router
