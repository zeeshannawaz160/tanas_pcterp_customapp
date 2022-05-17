const InvoicePayment = require("../models/invoicePaymentModel");
const Invoice = require("../models/invoiceModel");
const Account = require("../models/accountModel");
const factory = require("./handlerFactory");
const { Promise } = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const GeneralLedger = require("../models/generalLedgerModel");

exports.getAllInvoicePayments = factory.getAll(InvoicePayment);
exports.getInvoicePayment = factory.getOne(InvoicePayment, [
  { path: "invoice", select: "id paymentStatus name" },
  { path: "SOId", select: "id name" },
]);
// exports.createInvoicePayment = factory.createOne(InvoicePayment);
// exports.updateInvoicePayment = factory.updateOne(InvoicePayment);
exports.deleteInvoicePayment = factory.deleteOne(InvoicePayment);

exports.updateInvoicePayment = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // console.log(req.params.id);
  const payment = await InvoicePayment.findById(req.params.id);
  // console.log(payment);

  const paymentDocument = await InvoicePayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
    // bankAccount: req.body.bankAccount,
    // journalType: req.body.journalType,
    // paymentDate: req.body.paymentDate,
  ).populate([{ path: "invoice", select: "id paymentStatus name" }]);

  //
  let receivableAccount;

  // Find accounts needed for this method
  await Promise.all(
    (receivableAccount = await Account.find({ title: "Account receivable" }))
  );

  const generalLedgers = new Array();
  let generalLedger = new Object();

  // await Promise.all(
  generalLedger.date = paymentDocument.paymentDate;
  generalLedger.account = receivableAccount[0]._id; //13000 Account receivable
  generalLedger.journalLabel = "Customer Payment";
  generalLedger.reference = paymentDocument.memo;
  generalLedger.journal = "InvoicePayment";
  generalLedger.journalEntry = paymentDocument.id;
  generalLedger.entityType = "Customer";
  generalLedger.entity = req.body.customer;
  generalLedger.label = "Customer Payment - Rs. " + paymentDocument.amount;
  generalLedger.debit = 0.0;
  generalLedger.credit = paymentDocument.amount;
  generalLedgers.push(generalLedger);

  generalLedger1 = new Object();
  generalLedger1.date = paymentDocument.paymentDate;
  generalLedger1.account = paymentDocument.bankAccount[0]._id;
  generalLedger1.journalLabel = "Cuatomer Payment";
  generalLedger1.reference = paymentDocument.memo;
  generalLedger1.journal = "InvoicePayment";
  generalLedger1.journalEntry = paymentDocument.id;
  generalLedger1.entityType = "Customer";
  generalLedger1.entity = req.body.customer;
  generalLedger1.label = "Customer Payment - Rs. " + paymentDocument.amount;
  generalLedger1.debit = paymentDocument.amount;
  generalLedger1.credit = 0.0;
  generalLedgers.push(generalLedger1);
  // );
  console.log(generalLedgers);

  try {
    if (generalLedgers.length == 2) {
      const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
    }
  } catch (error) {
    console.log(error);
  }
  //

  const invoiceDocument = await Invoice.findByIdAndUpdate(
    paymentDocument.invoice,
    { paymentStatus: "Paid" }
  );

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});

exports.createInvoicePayment = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const paymentObject = new Object();
  let bankAccount;

  // Find accounts needed for this method
  await Promise.all((bankAccount = await Account.find({ title: "Bank" })));

  paymentObject.journalType = "Bank";
  paymentObject.invoice = req.body._id;
  paymentObject.bankAccount = bankAccount; // 1000 Bank
  if (req.body.sourceDocument.length) {
    paymentObject.SOId = req.body.sourceDocument.id;
    paymentObject.amount = req.body.estimation.total;
  } else {
    paymentObject.amount = req.body.estimation.total;
  }
  paymentObject.memo = req.body.name;
  paymentObject.referenceNumber = req.body.referenceNumber;

  // console.log(paymentObject);
  const paymentDocument = await InvoicePayment.create(paymentObject);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});

exports.createStandaloneInvoicePayment = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const paymentObject = new Object();
  paymentObject.journalType = "Bank";
  paymentObject.invoice = req.body.id;
  // paymentObject.SOId = req.body.sourceDocument.id;
  // paymentObject.bankAccount = req.body.recepientAccount;
  paymentObject.bankAccount = "61c0676b4b86464aac64ba99";
  paymentObject.amount = req.body.estimation.total;
  paymentObject.memo = req.body.name;

  // console.log(paymentObject);
  const paymentDocument = await InvoicePayment.create(paymentObject);
  // console.log(paymentDocument);
  // const invoiceDocument = await Invoice.findByIdAndUpdate(
  //   paymentDocument.invoice,
  //   { paymentStatus: "Paid" }
  // );
  // console.log(invoiceDocument);

  const generalLedgers = new Array();
  let generalLedger = new Object();

  generalLedger.date = paymentDocument.paymentDate;
  generalLedger.account = "61b839ddd6fe795ec8bf53fc"; //paymentDocument.recepientAccount;
  generalLedger.journalLabel = "Customer Payment";
  generalLedger.reference = paymentDocument.memo;
  generalLedger.journal = "InvoicePayment";
  generalLedger.journalEntry = paymentDocument.id;
  generalLedger.entityType = "Customer";
  generalLedger.entity = req.body.customer;
  generalLedger.label = "Customer Payment - Rs. " + paymentDocument.amount;
  generalLedger.debit = 0.0;
  generalLedger.credit = paymentDocument.amount;
  generalLedgers.push(generalLedger);

  generalLedger = new Object();
  generalLedger.date = paymentDocument.paymentDate;
  generalLedger.account = paymentDocument.bankAccount; // 10020 Cash
  generalLedger.journalLabel = "Customer Payment";
  generalLedger.reference = paymentDocument.memo;
  generalLedger.journal = "InvoicePayment";
  generalLedger.journalEntry = paymentDocument.id;
  generalLedger.entityType = "Customer";
  generalLedger.entity = req.body.customer;
  generalLedger.label = "Customer Payment - Rs. " + paymentDocument.amount;
  generalLedger.debit = paymentDocument.amount;
  generalLedger.credit = 0.0;
  generalLedgers.push(generalLedger);

  try {
    const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});
