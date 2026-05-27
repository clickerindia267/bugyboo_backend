import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import {
  createDTDCShipment,
  trackDTDCShipment,
  cancelDTDCShipment,
  generateDTDCLabel
} from '../controllers/shippingController.js'

const router = express.Router()

// Admin protected endpoints
router.post('/dtdc/create/:orderId', authMiddleware, adminMiddleware, createDTDCShipment)
router.post('/dtdc/cancel/:awb', authMiddleware, adminMiddleware, cancelDTDCShipment)
router.get('/dtdc/label/:awb', authMiddleware, adminMiddleware, generateDTDCLabel)

// Customer / Authenticated user tracking endpoint
router.get('/dtdc/track/:awb', authMiddleware, trackDTDCShipment)

export default router
