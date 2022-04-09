const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('./../model/bookingModel');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      next(new AppError(`No document found with that ID!`, 404));
      return;
    }
    // (204) means no content
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      next(new AppError('No document found with that ID!', 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save()
    const document = await Model.create({ ...req.body });

    // status(201) means created
    // .json below is synonymous to .send with a difference that .json means we are telling our code that we are sending back json format while .send means we are sending text or html format
    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    // Tour.findOne({ _id: req.params.id });
    if (!document) {
      return next(new AppError('No document found with that ID!', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //  EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate().query;
    // const document = await features.explain();
    const document = await features;

    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        data: document,
      },
    });
  });
