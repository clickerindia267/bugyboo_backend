import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'variantId is required']
  },
  selectedAgeGroup: {
    type: String,
    required: [true, 'Age group selection is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  selectedPrice: {
    type: Number,
    required: true,
    min: [0, 'Price must be non-negative']
  },
  productName: {
    type: String,
    default: null
  },
  productImage: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    default: null
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be non-negative']
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
    },
    courierPartner: {
      type: String,
      default: null
    },
    awbNumber: {
      type: String,
      default: null
    },
    trackingNumber: {
      type: String,
      default: null
    },
    shipmentStatus: {
      type: String,
      default: null
    },
    shippingLabelUrl: {
      type: String,
      default: null
    },
    shipmentCreated: {
      type: Boolean,
      default: false
    },
    shipmentResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    expectedDeliveryDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
