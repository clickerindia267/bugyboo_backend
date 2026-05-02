import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is missing'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = {
      id: decoded.id,
      role: decoded.role
    }
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    })
  }
}
