import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const refreshTokens = new Set()

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10d' }
  )
}

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  )
}

export const signup = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body

    if (!name || !email || !mobile || !password) {
      res.status(400)
      throw new Error('Please provide name, email, mobile, and password')
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(400)
      throw new Error('Email is already registered')
    }

    const existingMobile = await User.findOne({ mobile })
    if (existingMobile) {
      res.status(400)
      throw new Error('Mobile number is already registered')
    }

    const userCount = await User.countDocuments()
    const role = userCount === 0 ? 'admin' : 'user'

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      res.status(400)
      throw new Error('Please provide email or mobile and password')
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }]
    })

    if (!user) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    const accessToken = createAccessToken(user)
    const refreshToken = createRefreshToken(user)
    refreshTokens.add(refreshToken)

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) {
      res.status(400)
      throw new Error('Refresh token is required')
    }

    if (!refreshTokens.has(token)) {
      res.status(403)
      throw new Error('Refresh token is not valid or has been revoked')
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(403)
        return next(new Error('Invalid refresh token'))
      }

      const user = await User.findById(decoded.id)
      if (!user) {
        res.status(404)
        return next(new Error('User not found'))
      }

      refreshTokens.delete(token)
      const newAccessToken = createAccessToken(user)
      const newRefreshToken = createRefreshToken(user)
      refreshTokens.add(newRefreshToken)

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })
    })
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res, next) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) {
      res.status(400)
      throw new Error('Refresh token is required to logout')
    }

    refreshTokens.delete(token)

    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        role: req.user.role
      }
    })
  } catch (error) {
    next(error)
  }
}
