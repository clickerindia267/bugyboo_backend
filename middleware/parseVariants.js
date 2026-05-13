export const parseVariants = (req, res, next) => {
  if (!req.body || typeof req.body.variants === 'undefined') {
    return next()
  }

  const parseVariantValue = (value) => {
    if (typeof value === 'string') {
      return JSON.parse(value)
    }

    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      return value.map(item => JSON.parse(item))
    }

    return value
  }

  try {
    req.body.variants = parseVariantValue(req.body.variants)
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid variants format'
    })
  }

  next()
}
