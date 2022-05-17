const WorkCenter = require('../models/workCenterModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(WorkCenter);
exports.getOne = factory.getOne(WorkCenter);
exports.createOne = factory.createOne(WorkCenter);
exports.updateOne = factory.updateOne(WorkCenter);
exports.deleteOne = factory.deleteOne(WorkCenter);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await WorkCenter.find().select("name id");

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
