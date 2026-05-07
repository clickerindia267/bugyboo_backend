import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be non-negative']
  }
})

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Contact mobile is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
})

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be positive'],
      default: 0
    },
    contact: {
      type: contactSchema,
      required: true
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true
    },
   paymentMethod: {
  type: String,
  required: [true, 'Payment method is required'],
  trim: true,
  enum: ['COD', 'UPI'],
  default: 'COD'
},
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    transactionId: {
  type: String,
  default: null
},
    orderStatus: {
      type: String,
      enum: ['ordered', 'approved', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'ordered'
    }
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
