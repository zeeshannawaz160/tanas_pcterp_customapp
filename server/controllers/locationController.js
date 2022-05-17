const Location = require('../models/locationModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(Location);
exports.getOne = factory.getOne(Location);
exports.createOne = factory.createOne(Location);
exports.updateOne = factory.updateOne(Location);
exports.deleteOne = factory.deleteOne(Location);

exports.getList = catchAsync(async (req, res, next) => {
    const document = await Location.find().select("id name");
    res.status(200).json({
        isSuccess: true,
        status: "success",
        documents: document,
    });
});