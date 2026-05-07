import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      trim: true
    },
    razorpaySignature: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['paid', 'failed'],
      default: 'paid'
    }
  },
  {
    timestamps: true
  }
)

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
export default Payment
