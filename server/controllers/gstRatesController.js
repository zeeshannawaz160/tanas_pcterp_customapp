const GSTRates = require('../models/gstRatesModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllGSTRatess = factory.getAll(GSTRates);
exports.getGSTRates = factory.getOne(GSTRates);
exports.createGSTRates = factory.createOne(GSTRates);
exports.updateGSTRates = factory.updateOne(GSTRates);
exports.deleteGSTRates = factory.deleteOne(GSTRates);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await GSTRates.find().select("name id");

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

