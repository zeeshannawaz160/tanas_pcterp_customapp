const JobPosition = require('../models/jobPositionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(JobPosition);
exports.getOne = factory.getOne(JobPosition);
exports.createOne = factory.createOne(JobPosition);
exports.updateOne = factory.updateOne(JobPosition);
exports.deleteOne = factory.deleteOne(JobPosition);

exports.getList = catchAsync(async (req, res, next) => {
    const document = await JobPosition.find().select("id name");

    res.status(200).json({
        isSuccess: true,
        status: "success",
        documents: document,
    });
});