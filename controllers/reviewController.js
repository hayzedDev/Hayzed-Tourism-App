const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../model/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviewsFilter = (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  // Passing the filter object to the next middleware
  req.filter = filter;
  next();
};

exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create({ ...req.body });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
