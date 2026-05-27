import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

/**
 * Handle incoming tracking webhooks from DTDC
 * POST /api/webhooks/dtdc
 */
router.post('/dtdc', async (req, res, next) => {
  try {
    const payload = req.body
    console.log('[DTDC Webhook] Received webhook payload:', JSON.stringify(payload, null, 2))

    // Handle multiple potential field names from DTDC
    const awb = payload.awbNumber || payload.awb || payload.consignmentNumber || payload.trackingNumber
    const status = (payload.status || payload.shipmentStatus || payload.event || '').toLowerCase().trim()

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'AWB number is missing in the webhook payload'
      })
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is missing in the webhook payload'
      })
    }

    console.log(`[DTDC Webhook] Processing update for AWB: ${awb}, Status: ${status}`)

    // Find the corresponding order by AWB
    const order = await Order.findOne({ awbNumber: awb })

    if (!order) {
      console.log(`[DTDC Webhook] No order found in database matching AWB: ${awb}`)
      return res.status(404).json({
        success: false,
        message: `No matching order found for AWB: ${awb}`
      })
    }

    // Save exact DTDC raw status
    order.shipmentStatus = status

    // Map DTDC status to internal orderStatus schema:
    // Schema enum: ['ordered', 'approved', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
    let updatedOrderStatus = null

    if (status === 'delivered') {
      updatedOrderStatus = 'delivered'
      order.paymentStatus = 'success' // payment is successful upon delivery (COD / UPI)
    } else if (status === 'out_for_delivery' || status === 'out_for_del' || status === 'outfordelivery') {
      updatedOrderStatus = 'out_for_delivery'
    } else if (status === 'cancelled' || status === 'canceled' || status === 'void') {
      updatedOrderStatus = 'cancelled'
    } else if (status === 'in_transit' || status === 'intransit' || status === 'shipped' || status === 'dispatched') {
      updatedOrderStatus = 'shipped'
    } else if (status === 'rto' || status === 'returned') {
      console.log(`[DTDC Webhook] Shipment marked as RTO for Order ID: ${order._id}`)
      // RTO orders might stay as cancelled or custom state
      updatedOrderStatus = 'cancelled'
    }

    if (updatedOrderStatus) {
      order.orderStatus = updatedOrderStatus
      console.log(`[DTDC Webhook] Mapping status to orderStatus: ${updatedOrderStatus}`)
    }

    // Save order changes
    await order.save()
    console.log(`[DTDC Webhook] Successfully updated Order ID: ${order._id} matching AWB: ${awb}`)

    return res.status(200).json({
      success: true,
      message: 'Webhook processed and order synchronized successfully',
      data: {
        orderId: order._id,
        awbNumber: order.awbNumber,
        shipmentStatus: order.shipmentStatus,
        orderStatus: order.orderStatus
      }
    })
  } catch (error) {
    console.error('[DTDC Webhook ERROR] Failed to process webhook:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while processing DTDC webhook'
    })
  }
})

export default router
