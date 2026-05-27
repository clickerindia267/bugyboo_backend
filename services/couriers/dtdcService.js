import axios from 'axios'

// Helper to log DTDC operations
const log = (message, data = null) => {
  console.log(`[DTDC Service] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

const errorLog = (message, error) => {
  console.error(`[DTDC Service ERROR] ${message}:`, error.response?.data || error.message || error)
}

// Check if credentials are correct or if we should run in mock mode
const isMockMode = () => {
  const apiKey = process.env.DTDC_API_KEY
  const token = process.env.DTDC_ACCESS_TOKEN
  const baseUrl = process.env.DTDC_BASE_URL

  return !apiKey || apiKey === 'mock' || !token || token === 'mock' || !baseUrl
}

// Create reusable Axios instance with configurable headers/base URL
const getDtdcClient = () => {
  if (isMockMode()) {
    log('Running in MOCK mode (missing or mock credentials)')
    return null
  }

  return axios.create({
    baseURL: process.env.DTDC_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DTDC_API_KEY,
      'x-access-token': process.env.DTDC_ACCESS_TOKEN
    },
    timeout: 10000 // 10s timeout
  })
}

/**
 * Automatically create shipment / book consignment in DTDC
 * @param {Object} order - Mongoose Order Document
 * @param {Object} address - Address details
 * @returns {Promise<Object>} Shipment creation results
 */
export const createShipment = async (order, address) => {
  try {
    log(`Creating shipment for Order ID: ${order._id}`)
    
    // Prepare standardized payload matching typical DTDC specifications
    const payload = {
      customerCode: process.env.DTDC_CUSTOMER_CODE || 'DEMO_CUST',
      consignments: [
        {
          reference_number: order._id.toString(),
          shipper_name: 'BugyBoo Store',
          shipper_address: 'BugyBoo Office, Sector 62, Noida, India',
          shipper_pincode: '201301',
          shipper_phone: '9999999999',
          consignee_name: order.contact.name,
          consignee_address: address.fullAddress || `${address.addressLine || ''}, ${address.city || ''}`,
          consignee_pincode: address.pincode,
          consignee_phone: order.contact.mobile,
          weight: 0.5,
          pieces: order.products.reduce((acc, curr) => acc + curr.quantity, 0),
          declared_value: order.totalAmount,
          contents: 'Baby Products and Accessories'
        }
      ]
    }

    if (isMockMode()) {
      // Mock Success Response
      const mockAwb = `DTD${Math.floor(100000000 + Math.random() * 900000000)}`
      log(`Mocked shipment created with AWB: ${mockAwb}`)
      return {
        success: true,
        awbNumber: mockAwb,
        trackingNumber: mockAwb,
        shipmentStatus: 'booked',
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        shippingLabelUrl: `https://api.dtdc.com/v1/labels/mock/${mockAwb}.pdf`,
        response: {
          status: 'SUCCESS',
          message: 'Shipment created successfully (MOCK)',
          awb: mockAwb
        }
      }
    }

    const client = getDtdcClient()
    const response = await client.post('/v1/shipments', payload)
    
    log('Shipment response received:', response.data)
    
    // Parse response based on standard DTDC guidelines
    // Assuming response data is e.g. { success: true, awb: '...', ... } or standard nested consignment response
    const data = response.data
    const isSuccess = data.success || data.status === 'SUCCESS' || (data.consignments && data.consignments[0]?.status === 'SUCCESS')
    
    if (!isSuccess) {
      throw new Error(data.message || (data.consignments && data.consignments[0]?.message) || 'DTDC API failed to book consignment')
    }

    const awb = data.awbNumber || data.awb || (data.consignments && data.consignments[0]?.awb) || `DTD${Date.now()}`
    
    return {
      success: true,
      awbNumber: awb,
      trackingNumber: awb,
      shipmentStatus: 'booked',
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      shippingLabelUrl: data.shippingLabelUrl || `${process.env.DTDC_BASE_URL}/v1/labels/${awb}.pdf`,
      response: data
    }
  } catch (error) {
    errorLog(`createShipment failed for Order ${order._id}`, error)
    throw error
  }
}

/**
 * Track DTDC consignment status
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Track status details
 */
export const trackShipment = async (awbNumber) => {
  try {
    log(`Tracking consignment: ${awbNumber}`)

    if (isMockMode()) {
      log('Mocked tracking info returned')
      return {
        success: true,
        awbNumber,
        currentStatus: 'In Transit',
        deliveryStatus: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        scanHistory: [
          {
            location: 'Delhi Hub',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            activity: 'Shipment Left Hub'
          },
          {
            location: 'Noida Center',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            activity: 'Shipment Received at Noida Booking Facility'
          }
        ]
      }
    }

    const client = getDtdcClient()
    const response = await client.get(`/v1/tracking/${awbNumber}`)
    
    log('Tracking response received:', response.data)
    
    const data = response.data
    return {
      success: true,
      awbNumber,
      currentStatus: data.currentStatus || 'In Transit',
      deliveryStatus: data.deliveryStatus || 'in_transit',
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
      scanHistory: data.scanHistory || [],
      response: data
    }
  } catch (error) {
    errorLog(`trackShipment failed for AWB ${awbNumber}`, error)
    throw error
  }
}

/**
 * Cancel/Delete DTDC consignment
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelShipment = async (awbNumber) => {
  try {
    log(`Cancelling consignment: ${awbNumber}`)

    if (isMockMode()) {
      log('Mocked cancellation response returned')
      return {
        success: true,
        message: `Shipment ${awbNumber} cancelled successfully (MOCK)`
      }
    }

    const client = getDtdcClient()
    const response = await client.post(`/v1/shipments/cancel/${awbNumber}`)
    
    log('Cancellation response received:', response.data)
    return {
      success: true,
      message: response.data.message || `Shipment ${awbNumber} cancelled successfully`,
      response: response.data
    }
  } catch (error) {
    errorLog(`cancelShipment failed for AWB ${awbNumber}`, error)
    throw error
  }
}

/**
 * Generate Shipping Label PDF / Details
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Label details
 */
export const generateLabel = async (awbNumber) => {
  try {
    log(`Generating label for consignment: ${awbNumber}`)

    if (isMockMode()) {
      log('Mocked label URL generated')
      return {
        success: true,
        shippingLabelUrl: `https://api.dtdc.com/v1/labels/mock/${awbNumber}.pdf`
      }
    }

    const client = getDtdcClient()
    const response = await client.get(`/v1/shipments/label/${awbNumber}`)

    log('Label response received')
    return {
      success: true,
      shippingLabelUrl: response.data.shippingLabelUrl || `${process.env.DTDC_BASE_URL}/v1/labels/${awbNumber}.pdf`,
      response: response.data
    }
  } catch (error) {
    errorLog(`generateLabel failed for AWB ${awbNumber}`, error)
    throw error
  }
}
