import { body, validationResult } from 'express-validator'

export const createOrderValidation = [
  body('amount')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number')
]

export const validatePaymentVerification = [
  body('razorpay_order_id')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('razorpay_payment_id is required'),
  body('razorpay_signature')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('razorpay_signature is required')
]

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.param, message: err.msg }))
    })
  }
  next()
}
