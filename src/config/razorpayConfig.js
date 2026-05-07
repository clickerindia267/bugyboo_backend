import dotenv from 'dotenv'
dotenv.config()

import Razorpay from 'razorpay'

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    'Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
  )
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
})

export default razorpay