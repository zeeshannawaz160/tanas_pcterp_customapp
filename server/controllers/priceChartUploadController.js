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

/**
 * Title: Create price charts
 * Request: POST
 * Routes: api/v1/priceChartUpload
 *
 * This method will accepts the body data from the client and create price charts in mongodb.
 *
 * Change Log
 *           : Biswajit created this method
 */
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

/**
 * Title: Create price charts
 * Request: DELETE
 * Routes: api/v1/priceChartUpload
 *
 * This method will delete all data stored in price chart database.
 *
 * Change Log
 *           : Biswajit created this method
 */
exports.deletePriceChart = catchAsync(async (req, res, next) => {
  await PriceChartUpload.deleteMany();

  res.status(201).json({
    isSuccess: true,
    status: "success",
  });
});

/**
 * Title: Create price charts
 * Request: PATCH
 * Routes: api/v1/priceChartUpload
 *
 * This method will find MRP between given range received from query parameter named "search".
 *
 * Change Log
 *           : Biswajit created this method
 */
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
