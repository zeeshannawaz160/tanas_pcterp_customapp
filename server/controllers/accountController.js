const Account = require("../models/accountModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllAccounts = factory.getAll(Account, { path: "accountType" });
exports.getAccount = factory.getOne(Account);
exports.createAccount = factory.createOne(Account);
exports.updateAccount = factory.updateOne(Account);
exports.deleteAccount = factory.deleteOne(Account);

exports.getList = catchAsync(async (req, res, next) => {
    const doc = await Account.find().select("name id");

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
