const AppCenter = require('../models/appCenterModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(AppCenter);
exports.getOne = factory.getOne(AppCenter);
exports.createOne = factory.createOne(AppCenter);
exports.updateOne = factory.updateOne(AppCenter);
exports.deleteOne = factory.deleteOne(AppCenter);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await AppCenter.find().select("name id");

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