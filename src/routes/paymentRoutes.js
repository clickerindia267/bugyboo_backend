import express from 'express'
import { createOrder, verifyPayment } from '../controllers/paymentController.js'
import { createOrderValidation, validatePaymentVerification, validateRequest } from '../middleware/validatePayment.js'

const router = express.Router()

router.post('/create-order', createOrderValidation, validateRequest, createOrder)
router.post('/verify', validatePaymentVerification, validateRequest, verifyPayment)

export default router
