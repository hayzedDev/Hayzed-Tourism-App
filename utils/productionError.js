const AppError = require('./appError');

module.exports = class ProductionError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
};
