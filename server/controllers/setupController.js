const Setup = require("../models/setupModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllSetup = factory.getAll(Setup);
exports.getSetup = factory.getOne(Setup);
// exports.createCompany = factory.createOne(Setup);
exports.updateSetup = factory.updateOne(Setup);
exports.deleteSetup = factory.deleteOne(Setup);

exports.createSetup = catchAsync(async (req, res, next) => {
  console.log("query: ", req.query.setupType);
  console.log("body: ", req.body);
  let data = req.body;
  data.setupType = req.query.setupType;

  const docs = await Setup.find();
  let doc;

  if (docs.length) {
    doc = await Setup.findByIdAndUpdate(docs[0]._id, data, {
      new: true,
      runValidators: true,
    });
  } else {
    doc = await Setup.create(data);
  }

  if (!doc) {
    return next(new AppError("Issue in creating Setup", 404));
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: doc,
  });
});
