const AccountType = require('../models/accountTypeModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllAccountTypes = factory.getAll(AccountType, [{ path: 'createdBy', select: 'name' }]);
exports.getAccountType = factory.getOne(AccountType);
exports.createAccountType = factory.createOne(AccountType);
exports.updateAccountType = factory.updateOne(AccountType);
exports.deleteAccountType = factory.deleteOne(AccountType);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await AccountType.find().select("name id");

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