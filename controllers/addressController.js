import Address from '../models/Address.js'

export const addAddress = async (req, res, next) => {
  try {
    const { fullAddress, city, pincode, country } = req.body
    const userId = req.user.id

    if (!fullAddress || !city || !pincode || !country) {
      return res.status(400).json({ success: false, message: 'All address fields are required' })
    }

    const address = await Address.create({
      userId,
      fullAddress: fullAddress.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      country: country.trim()
    })

    res.status(201).json({ success: true, data: address })
  } catch (error) {
    next(error)
  }
}

export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 })
    res.json({ success: true, data: addresses })
  } catch (error) {
    next(error)
  }
}

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { fullAddress, city, pincode, country } = req.body

    const address = await Address.findOne({ _id: id, userId })
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    if (typeof fullAddress !== 'undefined') {
      address.fullAddress = fullAddress.trim()
    }
    if (typeof city !== 'undefined') {
      address.city = city.trim()
    }
    if (typeof pincode !== 'undefined') {
      address.pincode = pincode.trim()
    }
    if (typeof country !== 'undefined') {
      address.country = country.trim()
    }

    await address.save()
    res.json({ success: true, data: address })
  } catch (error) {
    next(error)
  }
}

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const address = await Address.findOneAndDelete({ _id: id, userId })
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    res.json({ success: true, data: address })
  } catch (error) {
    next(error)
  }
}
