export const successResponse = (res, message, data = {}, status = 200) =>
  res.status(status).json({
    success: true,
    message,
    data
  })

export const errorResponse = (res, message, status = 400, errors = undefined) => {
  const response = {
    success: false,
    message
  }

  if (errors) {
    response.errors = errors
  }

  return res.status(status).json(response)
}
