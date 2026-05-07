import Payment from '../models/paymentModel.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js'
import { errorResponse, successResponse } from '../utils/response.js'

const convertRupeesToPaise = (amount) => Math.round(Number(amount) * 100)

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body
    const amountNumber = Number(amount)

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      return errorResponse(res, 'Amount must be a positive number', 400)
    }

    const amountInPaise = convertRupeesToPaise(amountNumber)
    const order = await createRazorpayOrder(amountInPaise)

    return successResponse(res, 'Order created successfully', {
      key: process.env.RAZORPAY_KEY_ID,
      order
    }, 201)
  } catch (error) {
    console.error('createOrder error:', error)
    return errorResponse(res, 'Unable to create Razorpay order', 500)
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })

    if (!isValid) {
      return errorResponse(res, 'Payment verification failed', 400)
    }

    const paymentRecord = await Payment.create({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid'
    })

    return successResponse(res, 'Payment verified successfully', {
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentRecordId: paymentRecord._id
    })
  } catch (error) {
    console.error('verifyPayment error:', error)
    return errorResponse(res, 'Payment verification failed', 500)
  }
}
