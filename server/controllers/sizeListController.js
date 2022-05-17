const SizeList = require("../models/sizeListModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Promise } = require("mongoose");

exports.getAll = factory.getAll(SizeList, [
  //   { path: "supervisor", select: "id name" },
  //   { path: "parentSizeList", select: "id name" },
]);
exports.getOne = factory.getOne(SizeList);
exports.createOne = factory.createOne(SizeList);
exports.updateOne = factory.updateOne(SizeList);
exports.deleteOne = factory.deleteOne(SizeList);
