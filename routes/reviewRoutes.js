const express = require('express');
// we use mergeParams to access all the params in all the roures
const router = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviewsFilter, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
// router.route;

module.exports = router;
