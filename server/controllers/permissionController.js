const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const Permission = require("../models/permissionModel");

exports.getAll = factory.getAll(Permission);
exports.getOne = factory.getOne(Permission);
exports.createOne = factory.createOne(Permission);
exports.updateOne = factory.updateOne(Permission);
exports.deleteOne = factory.deleteOne(Permission);

exports.getList = catchAsync(async (req, res, next) => {
  const doc = await Permission.find().select("name code id");

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: doc.length,
    documents: doc,
  });
});
