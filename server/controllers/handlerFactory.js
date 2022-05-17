const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const CustomAppError = require("../utils/customAppError");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      // return next(new AppError("No document found with that ID", 404));
      return next(new CustomAppError(res, "No document found with that ID"));
    }

    res.status(204).json({
      isSuccess: true,
      status: "success",
      document: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      __user: req.user ? { name: req.user.name, _id: req.user._id } : "Unknown",
    });

    if (!doc) {
      return next(new CustomAppError(res, "No document found with that ID"));
    }

    res.status(200).json({
      isSuccess: true,
      status: "success",
      document: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new CustomAppError(res, "No document found with that ID"));
    }

    res.status(200).json({
      isSuccess: true,
      status: "success",
      document: doc,
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    // let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };

    // const features = new APIFeatures(Model.find(filter), req.query)
    //     .filter()
    //     .sort()
    //     .limitFields()
    //     .paginate();
    // const doc = await features.query.explain();
    const doc = await Model.find().populate(popOptions);

    // SEND RESPONSE
    res.status(200).json({
      isSuccess: true,
      status: "success",
      results: doc.length,
      documents: doc,
    });
  });
