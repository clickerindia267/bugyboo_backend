import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Category = mongoose.model('Category', categorySchema)
export default Category
