const Payment = require("../models/paymentModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const GeneralLedger = require("../models/generalLedgerModel");

exports.getAllPayments = factory.getAll(Payment);
exports.getPayment = factory.getOne(Payment);
// exports.createPayment = factory.createOne(Payment);
exports.updatePayment = factory.updateOne(Payment);
exports.deletePayment = factory.deleteOne(Payment);

exports.createPayment = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const paymentObject = new Object();
  paymentObject.journalType = "Journal";
  paymentObject.recipientAccount = req.body.recipientAccount;
  paymentObject.amount = req.body.total;
  paymentObject.memo = req.body.name;
  const paymentDocument = await Payment.create(paymentObject);
  const generalLedgers = new Array();
  let generalLedger = new Object();
  generalLedger.date = paymentDocument.paymentDate;
  generalLedger.account = paymentDocument.recipientAccount;
  generalLedger.journal = "Payment";
  generalLedger.journalEntry = paymentDocument.id;
  generalLedger.entityType = "Customer";
  generalLedger.entity = req.body.customer;
  generalLedger.label = "Bank Payment - Rs. " + paymentDocument.amount;
  generalLedger.debit = 0.0;
  generalLedger.credit = paymentDocument.amount;
  generalLedgers.push(generalLedger);
  generalLedger = new Object();
  generalLedger.date = paymentDocument.paymentDate;
  generalLedger.account = "618bb05b3fd6bd8920350372"; // outstanding receipt
  generalLedger.journal = "Payment";
  generalLedger.journalEntry = paymentDocument.id;
  generalLedger.entityType = "Customer";
  generalLedger.entity = req.body.customer;
  generalLedger.label = "Bank Payment - Rs. " + paymentDocument.amount;
  generalLedger.debit = paymentDocument.amount;
  generalLedger.credit = 0.0;
  generalLedgers.push(generalLedger);
  try {
    const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
    console.log(generalLedgerDocument);
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});
