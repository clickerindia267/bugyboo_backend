import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body
    const userId = req.user.id

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const qty = Math.max(1, Number(quantity) || 1)

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({
        userId,
        products: [{ productId, quantity: qty }]
      })
      return res.status(201).json({ success: true, data: cart })
    }

    const existingProduct = cart.products.find(item => item.productId.toString() === productId)
    if (existingProduct) {
      existingProduct.quantity += qty
    } else {
      cart.products.push({ productId, quantity: qty })
    }

    await cart.save()
    res.json({ success: true, data: cart })
  } catch (error) {
    next(error)
  }
}

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cart = await Cart.findOne({ userId }).populate('products.productId', 'name sellPrice images')
    res.json({ success: true, data: cart || { userId, products: [] } })
  } catch (error) {
    next(error)
  }
}

export const updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body
    const userId = req.user.id

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }

    if (typeof quantity === 'undefined') {
      return res.status(400).json({ success: false, message: 'quantity is required' })
    }

    const qty = Number(quantity)
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'quantity must be a positive number' })
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.products.find(item => item.productId.toString() === productId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' })
    }

    item.quantity = qty
    await cart.save()
    res.json({ success: true, data: cart })
  } catch (error) {
    next(error)
  }
}

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.products = cart.products.filter(item => item.productId.toString() !== productId)
    await cart.save()

    res.json({ success: true, data: cart })
  } catch (error) {
    next(error)
  }
}

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cart = await Cart.findOne({ userId })
    if (cart) {
      cart.products = []
      await cart.save()
    }
    res.json({ success: true, data: { userId, products: [] } })
  } catch (error) {
    next(error)
  }
}
