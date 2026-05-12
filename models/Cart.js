import mongoose from 'mongoose'

const cartProductSchema = new mongoose.Schema({
  productId: {
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
    enum: ['0-1', '1-3', '3-5', '5-7', '7-10', '10-13', '13+']
  },
  selectedPrice: {
    type: Number,
    required: [true, 'Price for selected variant is required'],
    min: [0, 'Price must be positive']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
})

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [cartProductSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Cart = mongoose.model('Cart', cartSchema)
export default Cart
