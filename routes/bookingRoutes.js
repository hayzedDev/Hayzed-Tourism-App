const express = require('express');
// const multer = require('multer');
const bookingController = require(`${__dirname}/../controllers/bookingController`);
const authController = require('./../controllers/authController');
const router = express.Router();

// Protected for logged in users
router.use(authController.protect);

router.get('/checkout-session/:tourid', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
