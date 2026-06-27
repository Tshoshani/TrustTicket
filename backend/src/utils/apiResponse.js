function successResponse(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
}

function errorResponse(res, code, message, details = {}, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details
    }
  });
}

module.exports = {
  successResponse,
  errorResponse
};