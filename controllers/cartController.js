import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, selectedAgeGroup, quantity = 1 } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }
    if (!variantId) {
      return res.status(400).json({ success: false, message: 'variantId is required' })
    }
    if (!selectedAgeGroup) {
      return res.status(400).json({ success: false, message: 'selectedAgeGroup is required' })
    }

    // Validate and get product
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Find the variant
    const variant = product.variants.id(variantId)
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found for this product' })
    }

    // Validate age group matches
    if (variant.ageGroup !== selectedAgeGroup) {
      return res.status(400).json({
        success: false,
        message: 'Selected age group does not match variant age group'
      })
    }

    const qty = Math.max(1, Number(quantity) || 1)
    const selectedPrice = variant.sellPrice

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({
        userId,
        products: [{
          productId,
          variantId,
          selectedAgeGroup,
          selectedPrice,
          quantity: qty
        }]
      })
      return res.status(201).json({ success: true, data: cart })
    }

    // Check if same product with same variant already exists in cart
    const existingProduct = cart.products.find(
      item => item.productId && item.productId.toString() === productId && item.variantId && item.variantId.toString() === variantId
    )

    if (existingProduct) {
      existingProduct.quantity += qty
    } else {
      cart.products.push({
        productId,
        variantId,
        selectedAgeGroup,
        selectedPrice,
        quantity: qty
      })
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
    const cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name color description variants images category',
      populate: { path: 'category', select: 'name' }
    })

    if (!cart) {
      return res.json({ success: true, data: { userId, products: [] } })
    }

    // Enrich cart with variant details
    const enrichedCart = {
      _id: cart._id,
      userId: cart.userId,
      products: cart.products.map(item => {
        const product = item.productId
        const variant = product?.variants?.id(item.variantId)
        
        return {
          _id: item._id,
          productId: item.productId,
          variantId: item.variantId,
          selectedAgeGroup: item.selectedAgeGroup,
          selectedPrice: item.selectedPrice,
          quantity: item.quantity,
          variantDetails: variant ? {
            ageGroup: variant.ageGroup,
            basePrice: variant.basePrice,
            sellPrice: variant.sellPrice
          } : null,
          subtotal: item.selectedPrice * item.quantity
        }
      }),
      createdAt: cart.createdAt
    }

    res.json({ success: true, data: enrichedCart })
  } catch (error) {
    next(error)
  }
}

export const updateCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body
    const userId = req.user.id

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }
    if (!variantId) {
      return res.status(400).json({ success: false, message: 'variantId is required' })
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

    const item = cart.products.find(
      product => product.productId && product.productId.toString() === productId && product.variantId && product.variantId.toString() === variantId
    )
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product variant not found in cart' })
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
    const { productId, variantId } = req.params
    const userId = req.user.id

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }
    if (!variantId) {
      return res.status(400).json({ success: false, message: 'variantId is required' })
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.products = cart.products.filter(
      item => !(item.productId && item.productId.toString() === productId && item.variantId && item.variantId.toString() === variantId)
    )
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
