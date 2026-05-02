import express from 'express'
import { body } from 'express-validator'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { adminMediaUpload } from '../middleware/upload.js'
import {
  createBlog,
  getAdminBlogs,
  updateBlog,
  deleteBlog,
  togglePublish,
  getPublishedBlogs,
  getBlogById
} from '../controllers/blogController.js'

const adminBlogRouter = express.Router()
const blogRouter = express.Router()

adminBlogRouter.post(
  '/',
  (req, res, next) => {
    adminMediaUpload(5, 'blog')(req, res, err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }
      next()
    })
  },
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validateRequest,
  createBlog
)

adminBlogRouter.get('/', getAdminBlogs)

adminBlogRouter.patch(
  '/:id',
  (req, res, next) => {
    adminMediaUpload(5, 'blog')(req, res, err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }
      next()
    })
  },
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  validateRequest,
  updateBlog
)

adminBlogRouter.delete('/:id', deleteBlog)

adminBlogRouter.patch(
  '/:id/publish',
  body('isPublished').exists().withMessage('isPublished is required').isBoolean().withMessage('isPublished must be true or false'),
  validateRequest,
  togglePublish
)

blogRouter.get('/', getPublishedBlogs)
blogRouter.get('/:id', getBlogById)

export { adminBlogRouter, blogRouter }
