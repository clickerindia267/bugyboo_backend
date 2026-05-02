import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullAddress: {
    type: String,
    required: [true, 'Full address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Address = mongoose.model('Address', addressSchema)
export default Address
