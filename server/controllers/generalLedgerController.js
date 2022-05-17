const GeneralLedger = require("../models/generalLedgerModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllGeneralLedgers = factory.getAll(GeneralLedger, [
  { path: "product", select: "id name" },
  { path: "entity", select: "id name" },
  { path: "account", select: "id name" },
  { path: "journalEntry", select: "id name" },
]);
exports.getGeneralLedger = factory.getOne(GeneralLedger);
exports.createGeneralLedger = factory.createOne(GeneralLedger);
exports.updateGeneralLedger = factory.updateOne(GeneralLedger);
exports.deleteGeneralLedger = factory.deleteOne(GeneralLedger);

exports.groupByAccount = catchAsync(async (req, res, next) => {
  let query = GeneralLedger.aggregate([
    {
      $lookup: {
        from: "accounts",
        localField: "account",
        foreignField: "_id",
        as: "anything",
      },
    },
    {
      $unwind: "$anything",
    },
    {
      $group: {
        _id: "$anything.name",
        debit: { $sum: "$debit" },
        credit: { $sum: "$credit" },
        balance: { $sum: "$balance" },
        count: { $sum: 1 },
        accounts: { $push: "$$ROOT" },
      },
    },
  ]);
  // if (popOptions) query = query.populate(popOptions);
  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: doc,
  });
});
