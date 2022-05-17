const UOM = require('../models/unitsModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllUOMs = factory.getAll(UOM);
exports.getUOM = factory.getOne(UOM);
exports.createUOM = factory.createOne(UOM);
exports.updateUOM = factory.updateOne(UOM);
exports.deleteUOM = factory.deleteOne(UOM);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await UOM.find().select("name id");

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