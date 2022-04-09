const AppError = require('../utils/appError');
const ProductionError = require('../utils/productionError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //   const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const value = Object.keys(err.keyValue);
  const message = `Duplicate field value '${value}'. Please use another ${value}!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors)
    .map((err) => err.message)
    .join('. ');
  const message = `Invalid input data: ${value}`;
  //   const message = err.errors.name.message;
  return new AppError(message, 400);
};

const handleJWTError = (_) =>
  new AppError(`Invalid token! Please log in again `, 401);

const handleJWTExpireError = (_) =>
  new AppError('Your token has expired!!! PLease log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    console.log('Dev error');
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // Rendered Website
  res.status(err.statusCode).render('error', {
    title: 'Error retreiving page',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      console.log('OPerational error block');
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //   programming or other type of error: don't know error details
    //   1) Log error to console

    console.error('ERROR 🎆', err);

    // 2) Send a generic messsage

    return res.status(500).json({
      status: 'error',
      message: 'Something went very very wrong!',
    });
  }
  // B) Rendered Website
  if (err.isOperational) {
    console.log('OPerational block');
    return res.status(err.statusCode).render('error', {
      title: 'Error retreiving page',
      msg: err.message,
    });
  }
  //   programming or other type of error: don't know error details
  //   1) Log error to console

  console.error('ERROR 🎆', err);

  // 2) Send a generic messsage

  return res.status(err.statusCode).render('error', {
    title: 'Error retreiving page',
    msg: 'PLease try again later!',
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    // let error = { ...err };
    const message = err.message;
    const statusCode = err.statusCode;
    // let error = new ProductionError(message, statusCode);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError(error);

    sendErrorProd(error, req, res);
  }
};
