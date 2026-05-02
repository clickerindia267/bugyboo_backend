import Category from '../models/Category.js'

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body
    const categoryExists = await Category.findOne({ name: name.trim() })
    if (categoryExists) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      })
    }

    const category = await Category.create({ name: name.trim() })
    res.status(201).json({ success: true, data: category })
  } catch (error) {
    next(error)
  }
}

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json({ success: true, data: categories })
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    res.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    next(error)
  }
}
