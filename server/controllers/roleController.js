const Role = require("../models/roleModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const diffHistory = require('mongoose-diff-history/diffHistory')

exports.getAll = factory.getAll(Role, [
  //   { path: "supervisor", select: "id name" },
  //   { path: "parentRole", select: "id name" },
]);
exports.getOne = factory.getOne(Role);
exports.createOne = factory.createOne(Role);
exports.updateOne = factory.updateOne(Role);
exports.deleteOne = factory.deleteOne(Role);

exports.roleList = catchAsync(async (req, res, next) => {
  const doc = await Role.find().select("name id");

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


exports.getHistories = catchAsync(async (req, res) => {

  const doc = await Role.findById(req.params.id);

  if (!doc)
    return next(
      new AppError(
        'Document not found!',
        400
      ));

  const historiesDoc = await diffHistory.getDiffs("Role", req.params.id, []);



  res.status(200).json({
    isSuccess: true,
    status: 'success',
    results: historiesDoc.length,
    documents: historiesDoc
  });
});
