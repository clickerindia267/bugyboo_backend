import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price must be positive']
  },
  sellPrice: {
    type: Number,
    required: [true, 'Sell price is required'],
    min: [0, 'Sell price must be positive']
  },
  gst: {
    type: Number,
    required: [true, 'GST is required'],
    min: [0, 'GST must be positive'],
    default: 0
  },
  images: [
    {
      type: String,
      required: true
    }
  ],
  isPaused: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Product = mongoose.model('Product', productSchema)
export default Product
