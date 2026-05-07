import crypto from 'crypto'
import razorpay from '../config/razorpayConfig.js'

const createReceiptId = () => `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export const createRazorpayOrder = async (amountInPaise) => {
  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: createReceiptId(),
    payment_capture: 1
  }

  const order = await razorpay.orders.create(options)

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt
  }
}

export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  return generatedSignature === razorpay_signature
}
