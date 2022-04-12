const express = require('express');
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

// router.use(authController.isLoggdIn);: check if a user is liogged in so as to render the header page (HTML)

router.use(viewController.renderAlertCheckout)

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggdIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggdIn, viewController.getTour);
router.get('/login', authController.isLoggdIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggdIn, viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.get('/forgotPassword', viewController.forgotMyPassword);
router.get('/resetPassword/:token', viewController.resetMyPassword);
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = router;
