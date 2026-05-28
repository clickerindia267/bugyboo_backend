import Order from '../models/Order.js'
import * as dtdcService from '../services/couriers/dtdcService.js'

/**
 * Manually create / trigger a shipment for an order
 * POST /api/shipping/dtdc/create/:orderId
 */
export const createDTDCShipment = async (req, res, next) => {
  try {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
      .populate('address')
      .populate('products.product')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    if (order.shipmentCreated) {
      return res.status(400).json({
        success: false,
        message: `Shipment already created with AWB: ${order.awbNumber}`
      })
    }

    if (!order.address) {
      return res.status(400).json({
        success: false,
        message: 'Order has no valid shipping address associated with it'
      })
    }

    console.log(`[Shipping Controller] Initiating manual shipment for order: ${orderId}`)
    const shipmentResult = await dtdcService.createShipment(order, order.address)

    if (shipmentResult.success) {
      order.courierPartner = 'DTDC'
      order.awbNumber = shipmentResult.awbNumber
      order.trackingNumber = shipmentResult.trackingNumber
      order.shipmentStatus = shipmentResult.shipmentStatus
      order.shippingLabelUrl = shipmentResult.shippingLabelUrl
      order.shipmentCreated = true
      order.shipmentResponse = shipmentResult.response
      order.expectedDeliveryDate = shipmentResult.expectedDeliveryDate

      await order.save()

      return res.status(201).json({
        success: true,
        message: 'DTDC shipment created successfully',
        data: {
          orderId: order._id,
          awbNumber: order.awbNumber,
          trackingNumber: order.trackingNumber,
          shipmentStatus: order.shipmentStatus,
          shippingLabelUrl: order.shippingLabelUrl,
          expectedDeliveryDate: order.expectedDeliveryDate
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to create shipment in DTDC API'
      })
    }
  } catch (error) {
    console.error('[Shipping Controller ERROR] createDTDCShipment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while creating DTDC shipment'
    })
  }
}

/**
 * Retrieve tracking details and scan history for an AWB
 * GET /api/shipping/dtdc/track/:awb
 */
export const trackDTDCShipment = async (req, res, next) => {
  try {
    const { awb } = req.params

    console.log(`[Shipping Controller] Tracking AWB: ${awb}`)
    const trackingInfo = await dtdcService.trackShipment(awb)

    if (trackingInfo.success) {
      // Sync with Order database if the AWB is associated with an order
      const order = await Order.findOne({ awbNumber: awb })
      if (order) {
        order.shipmentStatus = trackingInfo.deliveryStatus || trackingInfo.currentStatus
        if (trackingInfo.estimatedDelivery) {
          order.expectedDeliveryDate = trackingInfo.estimatedDelivery
        }
        await order.save()
        console.log(`[Shipping Controller] Synced tracking state in DB for AWB: ${awb}`)
      }

      return res.json({
        success: true,
        data: {
          awbNumber: trackingInfo.awbNumber,
          currentStatus: trackingInfo.currentStatus,
          deliveryStatus: trackingInfo.deliveryStatus,
          estimatedDelivery: trackingInfo.estimatedDelivery,
          scanHistory: trackingInfo.scanHistory
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve tracking info from DTDC'
      })
    }
  } catch (error) {
    console.error('[Shipping Controller ERROR] trackDTDCShipment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while tracking DTDC shipment'
    })
  }
}

/**
 * Cancel a shipment booking
 * POST /api/shipping/dtdc/cancel/:awb
 */
export const cancelDTDCShipment = async (req, res, next) => {
  try {
    const { awb } = req.params

    console.log(`[Shipping Controller] Cancelling shipment with AWB: ${awb}`)
    const cancelResult = await dtdcService.cancelShipment(awb)

    if (cancelResult.success) {
      // Update order status in database if matching AWB found
      const order = await Order.findOne({ awbNumber: awb })
      if (order) {
        order.shipmentStatus = 'cancelled'
        await order.save()
        console.log(`[Shipping Controller] Updated Order shipment status to cancelled for AWB: ${awb}`)
      }

      return res.json({
        success: true,
        message: cancelResult.message || 'Shipment cancelled successfully'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel shipment in DTDC'
      })
    }
  } catch (error) {
    console.error('[Shipping Controller ERROR] cancelDTDCShipment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while cancelling DTDC shipment'
    })
  }
}

/**
 * Retrieve shipping label URL
 * GET /api/shipping/dtdc/label/:awb
 */
export const generateDTDCLabel = async (req, res, next) => {
  try {
    const { awb } = req.params

    console.log(`[Shipping Controller] Fetching label URL for AWB: ${awb}`)
    const labelResult = await dtdcService.generateLabel(awb)

    if (labelResult.success) {
      if (labelResult.isBuffer) {
        res.setHeader('Content-Type', labelResult.contentType || 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=label-${awb}.pdf`)
        return res.send(labelResult.buffer)
      }

      // Sync label URL to order if found
      const order = await Order.findOne({ awbNumber: awb })
      if (order) {
        order.shippingLabelUrl = labelResult.shippingLabelUrl
        await order.save()
        console.log(`[Shipping Controller] Updated shippingLabelUrl for AWB: ${awb}`)
      }

      return res.json({
        success: true,
        data: {
          awbNumber: awb,
          shippingLabelUrl: labelResult.shippingLabelUrl
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate shipping label from DTDC'
      })
    }
  } catch (error) {
    console.error('[Shipping Controller ERROR] generateDTDCLabel:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while generating DTDC label'
    })
  }
}
