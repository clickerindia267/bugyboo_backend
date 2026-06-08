import Product from '../models/Product.js'
import Category from '../models/Category.js'

const parseVariantsPayload = (variants) => {
  if (!variants) {
    return []
  }

  if (typeof variants === 'string') {
    return JSON.parse(variants)
  }

  if (Array.isArray(variants) && variants.every(item => typeof item === 'string')) {
    return variants.map(item => JSON.parse(item))
  }

  return variants
}

export const createProduct = async (req, res, next) => {
  try {
    let variants = []

    try {
      variants = req.body.variants ? parseVariantsPayload(req.body.variants) : []
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variants format'
      })
    }

    const {
      name,
      category,
      color,
      description,
      gst
    } = req.body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one media file is required'
      })
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Variants array is required and must contain at least one variant'
      })
    }

    // Validate each variant
    for (const variant of variants) {
      if (!variant.ageGroup || variant.basePrice == null || variant.sellPrice == null) {
        return res.status(400).json({
          success: false,
          message: 'Each variant must have ageGroup, basePrice, and sellPrice'
        })
      }
      if (typeof variant.basePrice !== 'number' || variant.basePrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid basePrice for age group ${variant.ageGroup}`
        })
      }
      if (typeof variant.sellPrice !== 'number' || variant.sellPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid sellPrice for age group ${variant.ageGroup}`
        })
      }
    }

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const images = req.files.map(file => file.location || file.key)
    const media = req.files.map(file => ({
      url: file.location || file.key,
      type: file.mimetype && file.mimetype.startsWith('video/') ? 'video' : 'image'
    }))

    const product = await Product.create({
      name,
      category,
      color,
      description,
      variants,
      gst,
      images,
      media
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

    if (typeof updateData.variants !== 'undefined') {
      try {
        updateData.variants = parseVariantsPayload(updateData.variants)
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variants format'
        })
      }
    }

    let existingImages = []
    let hasExistingImagesSpecified = false
    if (typeof updateData.existingImages !== 'undefined') {
      hasExistingImagesSpecified = true
      try {
        if (typeof updateData.existingImages === 'string') {
          existingImages = JSON.parse(updateData.existingImages)
        } else if (Array.isArray(updateData.existingImages)) {
          existingImages = updateData.existingImages
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid existingImages format'
        })
      }
      delete updateData.existingImages
    }

    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    let currentImages = existingProduct.images || []
    let currentMedia = existingProduct.media || []

    if (hasExistingImagesSpecified) {
      currentImages = currentImages.filter(url => existingImages.includes(url))
      currentMedia = currentMedia.filter(m => existingImages.includes(m.url))
      
      existingImages.forEach(url => {
        if (!currentMedia.some(m => m.url === url)) {
          const lowercase = url.toLowerCase()
          const isVideo = lowercase.endsWith('.mp4') || lowercase.endsWith('.webm') || lowercase.endsWith('.mov') || lowercase.endsWith('.avi')
          currentMedia.push({ url, type: isVideo ? 'video' : 'image' })
        }
      })
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.location || file.key)
      const newMedia = req.files.map(file => ({
        url: file.location || file.key,
        type: file.mimetype && file.mimetype.startsWith('video/') ? 'video' : 'image'
      }))

      currentImages = [...currentImages, ...newImages]
      currentMedia = [...currentMedia, ...newMedia]
    }

    if (hasExistingImagesSpecified || (req.files && req.files.length > 0)) {
      updateData.images = currentImages
      updateData.media = currentMedia
    }

    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category)
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        })
      }
    }

    // Validate variants if provided
    if (updateData.variants) {
      if (!Array.isArray(updateData.variants) || updateData.variants.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Variants array must contain at least one variant'
        })
      }

      // Validate each variant
      for (const variant of updateData.variants) {
        if (!variant.ageGroup || variant.basePrice == null || variant.sellPrice == null) {
          return res.status(400).json({
            success: false,
            message: 'Each variant must have ageGroup, basePrice, and sellPrice'
          })
        }
        if (typeof variant.basePrice !== 'number' || variant.basePrice < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid basePrice for age group ${variant.ageGroup}`
          })
        }
        if (typeof variant.sellPrice !== 'number' || variant.sellPrice < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid sellPrice for age group ${variant.ageGroup}`
          })
        }
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
