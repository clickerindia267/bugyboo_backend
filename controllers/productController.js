import Product from '../models/Product.js'
import Category from '../models/Category.js'

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      color,
      size,
      description,
      basePrice,
      sellPrice,
      gst
    } = req.body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one media file is required'
      })
    }

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const images = req.files.map(file => file.location || file.key)

    const product = await Product.create({
      name,
      category,
      color,
      size,
      description,
      basePrice,
      sellPrice,
      gst,
      images
    })

    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name')
    res.json({ success: true, data: products })
  } catch (error) {
    next(error)
  }
}

export const getPublicProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isPaused: false }).populate('category', 'name')
    res.json({ success: true, data: products })
  } catch (error) {
    next(error)
  }
}

export const getPublicProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id, isPaused: false }).populate('category', 'name')
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, data: product })
  } catch (error) {
    next(error)
  }
}

export const searchPublicProducts = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' })
    }

    const query = q.trim()
    const products = await Product.find({
      isPaused: false,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('category', 'name')

    res.json({ success: true, data: products })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category)
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        })
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const pauseProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate(
      id,
      { isPaused: true },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    next(error)
  }
}
