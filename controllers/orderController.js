import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Address from '../models/Address.js'

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { contact, addressId, paymentMethod } = req.body

    if (!contact || !contact.name || !contact.mobile) {
      return res.status(400).json({ success: false, message: 'Contact name and mobile are required' })
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'addressId is required' })
    }

    if (paymentMethod !== 'COD') {
      return res.status(400).json({ success: false, message: 'Only COD is supported for paymentMethod' })
    }

    const address = await Address.findOne({ _id: addressId, userId })
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    const cart = await Cart.findOne({ userId })
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    const orderProducts = []
    let totalAmount = 0

    for (const item of cart.products) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` })
      }

      const productPrice = product.sellPrice ?? 0
      totalAmount += productPrice * item.quantity
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: productPrice
      })
    }

    const order = await Order.create({
      user: userId,
      products: orderProducts,
      totalAmount,
      contact: {
        name: contact.name.trim(),
        mobile: contact.mobile.trim(),
        email: contact.email?.trim() || ''
      },
      address: address._id,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'ordered'
    })

    cart.products = []
    await cart.save()

    res.status(201).json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id
    const orders = await Order.find({ user: userId })
      .populate('address')
      .populate('products.product', 'name sellPrice images')
    res.json({ success: true, data: orders })
  } catch (error) {
    next(error)
  }
}

export const getUserOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const order = await Order.findOne({ _id: id, user: userId })
      .populate('address')
      .populate('products.product', 'name sellPrice images')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const order = await Order.findOne({ _id: id, user: userId })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    if (order.orderStatus !== 'ordered') {
      return res.status(400).json({
        success: false,
        message: 'Order can only be cancelled when status is ordered'
      })
    }

    order.orderStatus = 'cancelled'
    await order.save()

    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email mobile role')
      .populate('products.product', 'name sellPrice')
      .populate('address')

    res.json({ success: true, data: orders })
  } catch (error) {
    next(error)
  }
}

export const getPendingOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: 'ordered' })
      .populate('user', 'name email mobile role')
      .populate('products.product', 'name sellPrice')
      .populate('address')

    res.json({ success: true, data: orders })
  } catch (error) {
    next(error)
  }
}

export const getDeliveredOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: 'delivered' })
      .populate('user', 'name email mobile role')
      .populate('products.product', 'name sellPrice')
      .populate('address')

    res.json({ success: true, data: orders })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['approved', 'shipped', 'cancelled', 'out_for_delivery', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      })
    }

    const update = { orderStatus: status }
    if (status === 'delivered') {
      update.paymentStatus = 'success'
    }

    const order = await Order.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}
