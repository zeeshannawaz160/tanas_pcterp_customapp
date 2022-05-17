const Department = require("../models/departmentModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAll = factory.getAll(Department, [
    { path: "supervisor", select: "id name" },
    { path: "parentDepartment", select: "id name" },
]);
exports.getOne = factory.getOne(Department);
exports.createOne = factory.createOne(Department);
exports.updateOne = factory.updateOne(Department);
exports.deleteOne = factory.deleteOne(Department);

exports.getList = catchAsync(async (req, res, next) => {
    const document = await Department.find().select("id name");
    res.status(200).json({
        isSuccess: true,
        status: "success",
        documents: document,
    });
});
