function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).send({
      message: 'Something went wrong!',
      error: err.message, // Optionally show the error message
    });
  }
  
  module.exports = errorHandler;