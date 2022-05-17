const PriceChartUpload = require("../models/priceChartUploadModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Promise } = require("mongoose");

exports.getAll = factory.getAll(PriceChartUpload, [
  //   { path: "supervisor", select: "id name" },
  //   { path: "parentPriceChartUpload", select: "id name" },
]);
exports.getOne = factory.getOne(PriceChartUpload);
exports.createOne = factory.createOne(PriceChartUpload);
exports.updateOne = factory.updateOne(PriceChartUpload);
exports.deleteOne = factory.deleteOne(PriceChartUpload);

exports.createPriceChart = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const doc = await PriceChartUpload.insertMany(
    req.body,
    function (error, docs) {
      console.log("error: ", error);
    }
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    documents: doc,
  });
});

exports.deletePriceChart = catchAsync(async (req, res, next) => {
  await PriceChartUpload.deleteMany();

  res.status(201).json({
    isSuccess: true,
    status: "success",
  });
});

exports.findMRP = catchAsync(async (req, res, next) => {
  console.log("data: ", req.query.search);

  const doc = await PriceChartUpload.find({
    $and: [
      { range0: { $lte: parseInt(req.query.search) } },
      { range1: { $gte: parseInt(req.query.search) } },
    ],
  });

  console.log(doc);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: doc[0],
  });
});
