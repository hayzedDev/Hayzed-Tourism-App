const { async } = require('regenerator-runtime');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const Tour = require('./../model/tourModel');
const Booking = require('./../model/bookingModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1

  res.status(200).render('overview', {
    tours,
    title: 'All tours',
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) return next(new AppError('There is no tour with that name!', 404));

  res.status(200).render('tour', {
    tour,
    title: `${tour.name} Tour`,
  });
});

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
//     path: 'reviews',
//     fields: 'review rating user',
//   });
//   res
//     .status(200)
//     .set(
//       'Content-Security-Policy',
//       "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
//     )
//     .render('tour', {
//       title: `${tour.title} Tour`,
//       tour,
//     });
// });

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
});
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings

  const bookings = await Booking.find({ user: req.user.id }).populate('tour');
  console.log(bookings);
  // .populate('guides');
  const tours = bookings.map((el) => el.tour);

  // 2) Find all tours with the returned IDs

  // const tourIds = bookings.map((el) => el.tour);
  // const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  console.log('updateUserData', req.body);
  const updatedCurrentUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  req.user = updatedCurrentUser;

  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
});

exports.forgotMyPassword = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot My Password',
  });
};
exports.resetMyPassword = (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'Reset My Password',
  });
};

exports.getSignupForm = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};
