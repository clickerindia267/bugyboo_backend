import express from 'express'
import { getPublicProducts, getPublicProductById, searchPublicProducts } from '../controllers/productController.js'

const router = express.Router()

router.get('/search', searchPublicProducts)
router.get('/', getPublicProducts)
router.get('/:id', getPublicProductById)

export default router
