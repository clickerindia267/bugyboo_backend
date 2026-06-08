import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema(
  {
    ageGroup: {
      type: String,
      required: [true, 'Age group is required'],
      trim: true,
      index: true
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required for variant'],
      min: [0, 'Base price must be positive']
    },
    sellPrice: {
      type: Number,
      required: [true, 'Sell price is required for variant'],
      min: [0, 'Sell price must be positive']
    }
  },
  { _id: true }
)

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
  description: {
    type: String,
    trim: true
  },
  variants: {
    type: [variantSchema],
    required: [true, 'Variants are required'],
    validate: {
      validator: function (variants) {
        return variants && variants.length > 0
      },
      message: 'At least one variant must be defined'
    }
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
  media: [
    {
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
      }
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
