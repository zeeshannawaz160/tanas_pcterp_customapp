const Vendor = require("../models/vendorModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const diffHistory = require('mongoose-diff-history/diffHistory')

exports.getAllVendors = factory.getAll(Vendor);
exports.getVendor = factory.getOne(Vendor);
exports.createVendor = factory.createOne(Vendor);
exports.updateVendor = factory.updateOne(Vendor);
exports.deleteVendor = factory.deleteOne(Vendor);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await Vendor.find().select("name id");

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

exports.getHistories = catchAsync(async (req, res) => {

    const doc = await Vendor.findById(req.params.id);

    if (!doc)
        return next(
            new AppError(
                'Document not found!',
                400
            ));

    const historiesDoc = await diffHistory.getDiffs("Vendor", doc._id, []);

    res.status(200).json({
        isSuccess: true,
        status: 'success',
        results: historiesDoc.length,
        documents: historiesDoc
    });
});
