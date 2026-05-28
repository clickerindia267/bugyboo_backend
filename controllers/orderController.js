import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Address from '../models/Address.js'
import User from '../models/User.js'
import { sendOrderConfirmationEmail } from '../emailTemplates/emailService.js'
import { createShipment } from '../services/couriers/dtdcService.js'

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

    if (!['COD', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      })
    }

    const address = await Address.findOne({ _id: addressId, userId })
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    const cart = await Cart.findOne({ userId }).populate('products.productId')
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    const orderProducts = []
    const emailProducts = []
    let totalAmount = 0

    for (const item of cart.products) {
      const product = item.productId
      if (!product) {
        // Skip deleted/missing products
        continue
      }

      // Validate variant exists
      const variant = product.variants ? product.variants.id(item.variantId) : null
      if (!variant) {
        // Skip invalid/deleted variants
        continue
      }

      const subtotal = item.selectedPrice * item.quantity
      totalAmount += subtotal

      orderProducts.push({
        product: product._id,
        productName: product.name,
        productImage: product.images && product.images[0] ? product.images[0] : null,
        price: item.selectedPrice,
        variantId: item.variantId,
        selectedAgeGroup: item.selectedAgeGroup,
        quantity: item.quantity,
        selectedPrice: item.selectedPrice,
        subtotal
      })

      // Collect product details for email
      emailProducts.push({
        productName: product.name,
        productDescription: product.description || 'N/A',
        ageGroup: item.selectedAgeGroup,
        price: item.selectedPrice,
        quantity: item.quantity,
        subtotal,
        productImage: product.images && product.images[0] ? product.images[0] : null
      })
    }

    if (orderProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products in your cart. Your cart may contain deleted products.' })
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
      paymentMethod,
      paymentStatus:
        paymentMethod === 'UPI' ? 'success' : 'pending',
      transactionId:
        req.body.transactionId || null,
      orderStatus: 'ordered'
    })

    cart.products = []
    await cart.save()

    // Send order confirmation email
    try {
      const user = await User.findById(userId)
      if (user) {
        const emailData = {
          email: contact.email || user.email,
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          userName: contact.name,
          products: emailProducts,
          totalAmount,
          deliveryAddress: {
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            pinCode: address.pinCode
          },
          contact: {
            name: contact.name,
            mobile: contact.mobile
          }
        }
        await sendOrderConfirmationEmail(emailData)
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError.message)
      // Don't fail the order if email fails, just log it
    }

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
      .populate('products.product', 'name sellPrice images')
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
      .populate('products.product', 'name sellPrice images')
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
      .populate('products.product', 'name sellPrice images')
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

    // Automatic DTDC Courier Integration Trigger
    if (['approved', 'shipped'].includes(status) && !order.shipmentCreated) {
      try {
        // Fetch and populate address
        const populatedOrder = await Order.findById(order._id)
          .populate('address')
          .populate('products.product')

        if (populatedOrder && populatedOrder.address) {
          console.log(`[Order Status Update] Triggering DTDC automatic shipment creation for order: ${order._id}`)
          const shipmentResult = await createShipment(populatedOrder, populatedOrder.address)
          
          if (shipmentResult && shipmentResult.success) {
            order.courierPartner = 'DTDC'
            order.awbNumber = shipmentResult.awbNumber
            order.trackingNumber = shipmentResult.trackingNumber
            order.shipmentStatus = shipmentResult.shipmentStatus
            order.shippingLabelUrl = shipmentResult.shippingLabelUrl
            order.shipmentCreated = true
            order.shipmentResponse = shipmentResult.response
            order.expectedDeliveryDate = shipmentResult.expectedDeliveryDate
            
            await order.save()
            console.log(`[Order Status Update] DTDC shipment successfully created for order: ${order._id}. AWB: ${shipmentResult.awbNumber}`)
          }
        }
      } catch (shippingError) {
        console.error(`[Order Status Update ERROR] DTDC automatic shipment failed for order ${order._id}:`, shippingError.message)
        // Flow continues safely, orderStatus remains updated
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email mobile role')
      .populate('products.product', 'name sellPrice images')
      .populate('address')

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    next(error)
  }
}
