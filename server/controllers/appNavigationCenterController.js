const AppNavigationCenter = require('../models/appNavigationCenter');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(AppNavigationCenter, [{ path: 'appNavigationTabs' }]);
exports.getOne = factory.getOne(AppNavigationCenter);
exports.createOne = factory.createOne(AppNavigationCenter);
exports.updateOne = factory.updateOne(AppNavigationCenter);
exports.deleteOne = factory.deleteOne(AppNavigationCenter);

exports.getOneByType = catchAsync(async (req, res, next) => {

    const document = await AppNavigationCenter.findOne({ type: req.query.navigationCenterType });
    console.log(document)
    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });
});