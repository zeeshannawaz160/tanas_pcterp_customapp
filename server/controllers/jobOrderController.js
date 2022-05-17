const JobOrder = require("../models/jobOrderModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAll = factory.getAll(JobOrder, [
  { path: "product", select: "id name" },
]);
exports.getOne = factory.getOne(JobOrder);
exports.createOne = factory.createOne(JobOrder);
exports.updateOne = factory.updateOne(JobOrder);
exports.deleteOne = factory.deleteOne(JobOrder);
