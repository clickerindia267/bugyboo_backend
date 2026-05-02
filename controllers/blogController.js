import Blog from '../models/Blog.js'

export const createBlog = async (req, res, next) => {
  try {
    const { title, description, isPublished } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' })
    }

    if (req.files.length > 5) {
      return res.status(400).json({ success: false, message: 'You can upload up to 5 images' })
    }

    const images = req.files.map(file => file.location || file.key)
    const createdBy = req.user?.id || req.user?._id

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      images,
      createdBy,
      isPublished: typeof isPublished !== 'undefined' ? isPublished : true
    })

    res.status(201).json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

export const getAdminBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate('createdBy', 'name email role')
    res.json({ success: true, blog: blogs })
  } catch (error) {
    next(error)
  }
}

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    const updateData = {}

    if (typeof title !== 'undefined') {
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' })
      }
      updateData.title = title.trim()
    }

    if (typeof description !== 'undefined') {
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' })
      }
      updateData.description = description.trim()
    }

    if (req.files && req.files.length > 5) {
      return res.status(400).json({ success: false, message: 'You can upload up to 5 images' })
    }

    let blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.location || file.key)
      blog.images.push(...newImages)
    }

    Object.assign(blog, updateData)
    await blog.save()

    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

export const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params
    const { isPublished } = req.body

    if (typeof isPublished === 'undefined') {
      return res.status(400).json({ success: false, message: 'isPublished is required' })
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true, runValidators: true }
    )

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

export const getPublishedBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).populate('createdBy', 'name email role').sort({ createdAt: -1 })
    res.json({ success: true, blog: blogs })
  } catch (error) {
    next(error)
  }
}

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id).populate('createdBy', 'name email role')
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}
