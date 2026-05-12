export const parseVariants = (req, res, next) => {
  if (!req.body || typeof req.body.variants === 'undefined') {
    return next()
  }

  if (typeof req.body.variants === 'string') {
    try {
      req.body.variants = JSON.parse(req.body.variants)
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variants format'
      })
    }
  }

  next()
}
