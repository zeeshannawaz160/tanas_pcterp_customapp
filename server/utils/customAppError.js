class CustomAppError {
  constructor(res, message) {
    res.status(200).json({
      isSuccess: false,
      Error: true,
      message: message,
    });
  }
}

module.exports = CustomAppError;
