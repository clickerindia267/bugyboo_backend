import axios from 'axios'

// Helper to log DTDC operations
const log = (message, data = null) => {
  console.log(`[DTDC Service] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

const errorLog = (message, error) => {
  console.error(`[DTDC Service ERROR] ${message}:`, error.response?.data || error.message || error)
}

// Get corrected base URL, overriding legacy/wrong endpoints in environment
const getBaseUrl = () => {
  const url = process.env.DTDC_BASE_URL
  if (!url || url.includes('apiv2.dtdc.com')) {
    return 'https://pxapi.dtdc.in'
  }
  return url
}

// Check if credentials are correct or if we should run in mock mode
const isMockMode = () => {
  const apiKey = process.env.DTDC_API_KEY
  return !apiKey || apiKey === 'mock'
}

// Create reusable Axios instance for Consignment APIs
const getConsignmentClient = () => {
  const baseUrl = getBaseUrl()
  
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DTDC_API_KEY
    },
    timeout: 10000 // 10s timeout
  })
}

// Create reusable Axios instance for Tracking APIs
const getTrackingClient = () => {
  const trackingUrl = process.env.DTDC_TRACKING_URL || 'https://blktracksvc.dtdc.com'
  
  return axios.create({
    baseURL: trackingUrl,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': process.env.DTDC_ACCESS_TOKEN
    },
    timeout: 10000 // 10s timeout
  })
}

/**
 * Handle and categorize DTDC API integration errors
 * @param {Error} error - The caught Axios or generic error
 * @param {string} context - The context of the operation (e.g. createShipment)
 */
const handleDtdcError = (error, context) => {
  const code = error.code || ''
  const status = error.response?.status
  const responseData = error.response?.data

  let errorMsg = `DTDC ${context} failed: `

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    errorMsg += 'DNS Lookup Error. DTDC server domain could not be resolved. Please verify process.env.DTDC_BASE_URL/DTDC_TRACKING_URL or internet connectivity.'
  } else if (status === 401 || status === 403) {
    errorMsg += `Authentication / Access Denied (HTTP ${status}). Please verify your process.env.DTDC_API_KEY or process.env.DTDC_ACCESS_TOKEN.`
  } else if (status === 400) {
    errorMsg += `Validation or Mismatched Request Parameters (HTTP 400). Response: ${JSON.stringify(responseData)}`
  } else if (status === 404) {
    errorMsg += `API Endpoint not found (HTTP 404). Please verify your paths.`
  } else {
    errorMsg += error.message || 'Unknown network error'
  }

  console.error(`[DTDC Error Handler] ${errorMsg}`)
  throw new Error(errorMsg)
}

/**
 * Automatically create shipment / book consignment in DTDC
 * POST /api/customer/integration/consignment/softdata
 * @param {Object} order - Mongoose Order Document
 * @param {Object} address - Address details
 * @returns {Promise<Object>} Shipment creation results
 */
export const createShipment = async (order, address) => {
  try {
    const baseUrl = getBaseUrl()
    const fullUrl = `${baseUrl}/api/customer/integration/consignment/softdata`
    
    log(`Creating shipment for Order ID: ${order._id}`)
    console.log("[DTDC] URL:", fullUrl)

    if (isMockMode()) {
      const mockAwb = `DTD${Math.floor(100000000 + Math.random() * 900000000)}`
      log(`Mocked shipment created successfully with AWB: ${mockAwb}`)
      return {
        success: true,
        awbNumber: mockAwb,
        trackingNumber: mockAwb,
        shipmentStatus: 'booked',
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        shippingLabelUrl: `https://api.dtdc.com/v1/labels/mock/${mockAwb}.pdf`,
        response: {
          status: 'SUCCESS',
          message: 'Shipment created successfully (MOCK)',
          awb: mockAwb
        }
      }
    }

    // Official production softdata payload structure
   const payload = { consignments: [ { customer_code: process.env.DTDC_CUSTOMER_CODE, service_type_id: "B2C PRIORITY", load_type: "NON-DOCUMENT", consignment_type: "Forward", description: "BugyBoo Kids Products", dimension_unit: "cm", length: "10", width: "10", height: "10", weight_unit: "kg", weight: "0.5", declared_value: String(order.totalAmount || 500), num_pieces: String( order.products?.reduce( (acc, curr) => acc + curr.quantity, 0 ) || 1 ), origin_details: { name: "BugyBoo", phone: "9999999999", alternate_phone: "", address_line_1: "BugyBoo Office", address_line_2: "", pincode: "201301", city: "Noida", state: "Uttar Pradesh" }, destination_details: { name: order.contact?.name || "Customer", phone: order.contact?.mobile || "9999999999", alternate_phone: "", address_line_1: address.fullAddress || address.addressLine || "Customer Address", address_line_2: "", pincode: address.pincode || "110001", city: address.city || "Delhi", state: address.state || "Delhi" }, customer_reference_number: order._id.toString(), cod_collection_mode: order.paymentMethod === "COD" ? "CASH" : "", cod_amount: order.paymentMethod === "COD" ? String(order.totalAmount) : "", commodity_id: "7", reference_number: "" } ] }

    const client = getConsignmentClient()
    const response = await client.post('/api/customer/integration/consignment/softdata', payload)
    
    log('Shipment response received:', response.data)
    
    const data = response.data
    const isSuccess = data.success || data.status === 'SUCCESS' || (data.consignments && data.consignments[0]?.status === 'SUCCESS')
    
    if (!isSuccess) {
      throw new Error(data.message || (data.consignments && data.consignments[0]?.message) || 'DTDC API failed to book consignment')
    }

    const awb = data.awbNo || data.awbNumber || data.awb || (data.consignments && data.consignments[0]?.awb) || (data.consignments && data.consignments[0]?.awbNo) || `DTD${Date.now()}`
    
    return {
      success: true,
      awbNumber: awb,
      trackingNumber: awb,
      shipmentStatus: 'booked',
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      shippingLabelUrl: data.shippingLabelUrl || `${baseUrl}/api/customer/integration/consignment/shippinglabel/stream?reference_number=${awb}&label_code=SHIP_LABEL_4X6&label_format=pdf`,
      response: data
    }
  } catch (error) {
    errorLog(`createShipment failed for Order ${order._id}`, error)
    handleDtdcError(error, 'createShipment')
  }
}

/**
 * Retrieve tracking details and scan history from the dedicated tracking server
 * POST /dtdc-api/rest/JSONCnTrk/getTrackDetails
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Track status details
 */
export const trackShipment = async (awbNumber) => {
  try {
    const trackingUrl = process.env.DTDC_TRACKING_URL || 'https://blktracksvc.dtdc.com'
    const fullUrl = `${trackingUrl}/dtdc-api/rest/JSONCnTrk/getTrackDetails`
    
    log(`Tracking consignment: ${awbNumber}`)
    console.log("[DTDC] URL:", fullUrl)

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

    // Official production tracking payload schema
    const payload = {
      trkType: 'cnno',
      strcnno: awbNumber,
      addtnlDtl: 'Y'
    }

    const client = getTrackingClient()
    const response = await client.post('/dtdc-api/rest/JSONCnTrk/getTrackDetails', payload)
    
    log('Tracking response received:', response.data)
    
    const data = response.data
    
    // Process typical nested track responses
    const trackDetails = data?.trackHeader || data
    
    return {
      success: true,
      awbNumber,
      currentStatus: trackDetails.strStatus || trackDetails.currentStatus || 'In Transit',
      deliveryStatus: (trackDetails.strStatus || trackDetails.deliveryStatus || 'in_transit').toLowerCase(),
      estimatedDelivery: trackDetails.expectedDeliveryDate || trackDetails.estimatedDelivery ? new Date(trackDetails.expectedDeliveryDate || trackDetails.estimatedDelivery) : null,
      scanHistory: data.scanInfo || data.scanHistory || [],
      response: data
    }
  } catch (error) {
    errorLog(`trackShipment failed for AWB ${awbNumber}`, error)
    handleDtdcError(error, 'trackShipment')
  }
}

/**
 * Cancel a shipment manifest
 * POST /api/customer/integration/consignment/cancel
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelShipment = async (awbNumber) => {
  try {
    const baseUrl = getBaseUrl()
    const fullUrl = `${baseUrl}/api/customer/integration/consignment/cancel`
    
    log(`Cancelling consignment: ${awbNumber}`)
    console.log("[DTDC] URL:", fullUrl)

    if (isMockMode()) {
      log('Mocked cancellation response returned')
      return {
        success: true,
        message: `Shipment ${awbNumber} cancelled successfully (MOCK)`
      }
    }

    // Official production cancel payload schema
    const payload = {
      AWBNo: [awbNumber],
      customerCode: process.env.DTDC_CUSTOMER_CODE || 'DEMO_CUST'
    }

    const client = getConsignmentClient()
    const response = await client.post('/api/customer/integration/consignment/cancel', payload)
    
    log('Cancellation response received:', response.data)
    
    const data = response.data
    const isSuccess = data.success || data.status === 'SUCCESS' || data.code === 200

    if (!isSuccess) {
      throw new Error(data.message || 'DTDC API failed to cancel consignment')
    }

    return {
      success: true,
      message: data.message || `Shipment ${awbNumber} cancelled successfully`,
      response: data
    }
  } catch (error) {
    errorLog(`cancelShipment failed for AWB ${awbNumber}`, error)
    handleDtdcError(error, 'cancelShipment')
  }
}

/**
 * Generate Shipping Label stream
 * GET /api/customer/integration/consignment/shippinglabel/stream
 * @param {string} awbNumber - AWB / Tracking number
 * @returns {Promise<Object>} Label details containing PDF arraybuffer
 */
export const generateLabel = async (awbNumber) => {
  try {
    const baseUrl = getBaseUrl()
    const fullUrl = `${baseUrl}/api/customer/integration/consignment/shippinglabel/stream`
    
    log(`Generating label for consignment: ${awbNumber}`)
    console.log("[DTDC] URL:", fullUrl)

    if (isMockMode()) {
      log('Mocked label URL generated')
      return {
        success: true,
        isMock: true,
        shippingLabelUrl: `https://api.dtdc.com/v1/labels/mock/${awbNumber}.pdf`
      }
    }

    const client = getConsignmentClient()
    const response = await client.get('/api/customer/integration/consignment/shippinglabel/stream', {
      params: {
        reference_number: awbNumber,
        label_code: 'SHIP_LABEL_4X6',
        label_format: 'pdf'
      },
      responseType: 'arraybuffer'
    })

    log('Label PDF buffer stream received')
    
    return {
      success: true,
      isBuffer: true,
      buffer: response.data,
      contentType: 'application/pdf'
    }
  } catch (error) {
    errorLog(`generateLabel failed for AWB ${awbNumber}`, error)
    handleDtdcError(error, 'generateLabel')
  }
}
