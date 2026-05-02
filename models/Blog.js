import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Blog description is required']
    },
    images: [
      {
        type: String,
        trim: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const Blog = mongoose.model('Blog', blogSchema)
export default Blog
