const errorHandlerFunction = (res, error) => {
  console.log('Error:', error)
  if (error.status) {
    if (error.status < 500) {
      return res.clientError({
        ...error.error,
        statusCode: error.status,
      })
    }
    return res.internalServerError({ ...error.error })
  }
  return res.internalServerError({ msg: error.message })
}

module.exports = {
  errorHandlerFunction,
}
