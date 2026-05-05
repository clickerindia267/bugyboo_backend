import Order from '../models/Order.js'

export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments()
    const successfulPayments = await Order.countDocuments({ paymentStatus: 'success' })

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])

    const pendingOrders = await Order.countDocuments({ orderStatus: 'ordered' })
    const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' })

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: revenueResult[0]?.totalRevenue ?? 0,
        totalPayments: successfulPayments,
        pendingOrders,
        pendingPayments
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments()
    const successfulPayments = await Order.countDocuments({ paymentStatus: 'success' })

    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])

    const successRevenue = totalRevenueResult[0]?.totalRevenue ?? 0
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 29)

    const dailyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'success', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(now.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'success', createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    res.json({
      success: true,
      data: {
        totalRevenue: successRevenue,
        totalOrders,
        successfulPayments,
        dailyRevenue: dailyRevenue.map(item => ({ date: item._id, revenue: item.revenue })),
        monthlyRevenue: monthlyRevenue.map(item => ({ period: item._id, revenue: item.revenue }))
      }
    })
  } catch (error) {
    next(error)
  }
}
