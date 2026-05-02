import Cart from '../models/Cart.js'
import Order from '../models/Order.js'

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id

    const totalOrders = await Order.countDocuments({ user: userId })
    const deliveredOrders = await Order.countDocuments({ user: userId, orderStatus: 'delivered' })
    const pendingOrders = await Order.countDocuments({
      user: userId,
      orderStatus: { $in: ['ordered', 'shipped'] }
    })

    const cart = await Cart.findOne({ userId })
    const totalCartItems = cart ? cart.products.reduce((sum, item) => sum + item.quantity, 0) : 0

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalCartItems
      }
    })
  } catch (error) {
    next(error)
  }
}
