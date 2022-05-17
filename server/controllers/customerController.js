const Customer = require("../models/customerModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const diffHistory = require('mongoose-diff-history/diffHistory')

exports.getAllCustomers = factory.getAll(Customer);
exports.getCustomer = factory.getOne(Customer);
exports.createCustomer = factory.createOne(Customer);
exports.updateCustomer = factory.updateOne(Customer);
exports.deleteCustomer = factory.deleteOne(Customer);

exports.getList = catchAsync(async (req, res, next) => {
  const document = await Customer.find().select("id name");
  console.log(document);
  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: document,
  });

  //const document = await Item.find({ name: });
});

exports.getHistories = catchAsync(async (req, res) => {

  const doc = await Customer.findById(req.params.id);

  if (!doc)
    return next(
      new AppError(
        'Document not found!',
        400
      ));

  const historiesDoc = await diffHistory.getDiffs("Customer", doc._id, []);

  res.status(200).json({
    isSuccess: true,
    status: 'success',
    results: historiesDoc.length,
    documents: historiesDoc
  });
});
