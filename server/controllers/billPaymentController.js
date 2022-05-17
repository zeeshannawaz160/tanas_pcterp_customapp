const BillPayment = require("../models/billPaymentModel");
const Bill = require("../models/billModel");
const Account = require("../models/accountModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const GeneralLedger = require("../models/generalLedgerModel");
const NewBill = require("../models/billModel");

exports.getAllBillPayments = factory.getAll(BillPayment);
exports.getBillPayment = factory.getOne(BillPayment, [
  { path: "bill", select: "id name paymentStatus vendor" },
  { path: "sourceDocument", select: "id name" },
]);
// exports.createBillPayment = factory.createOne(BillPayment);
exports.updateBillPayment = factory.updateOne(BillPayment);
exports.deleteBillPayment = factory.deleteOne(BillPayment);

/**
 * Title: Create bill payment
 * Request: POST
 * Routes: api/v1/billPayment/updateBillPaymentAndBill/:id
 *
 * Method description:
 * This method will accepts the id of bill payment from params and update it. After that update the bill's payment status to "Paid"
 * then create GL.
 *
 * Changes Log:
 * 13-05-2022: Biswajit update bill payment, update bill's payment status to "Paid" and create GL
 *
 */
exports.updateBillPaymentAndBill = catchAsync(async (req, res, next) => {
  try {
    console.log(req.body);

    const paymentDocument = await BillPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await NewBill.findByIdAndUpdate(paymentDocument.bill, {
      paymentStatus: "Paid",
    });

    console.log("paymentDocument", paymentDocument);

    //
    let payableAccount;

    // Find accounts needed for this method
    await Promise.all(
      (payableAccount = await Account.find({ title: "Account Payable" }))
    );

    const generalLedgers = new Array();
    let generalLedger = new Object();
    generalLedger.date = paymentDocument?.paymentDate;
    // generalLedger.account = "61c0676b4b86464aac64ba99"; //accounts payable
    generalLedger.account = payableAccount[0]?._id; //accounts payable
    generalLedger.journalLabel = "Bank"; // Inventory Adjustment
    generalLedger.reference = paymentDocument?.memo;
    generalLedger.journal = "BillPayment"; // InventoryAdjustment
    generalLedger.journalEntry = req.params.id;
    generalLedger.entityType = "Vendor";
    generalLedger.entity = req.body.bill.vendor;
    generalLedger.label = "Vendor Payment - Rs. " + paymentDocument?.amount;
    generalLedger.debit = paymentDocument?.amount;
    generalLedger.credit = 0.0;
    generalLedgers.push(generalLedger);

    generalLedger = new Object();
    generalLedger.date = paymentDocument?.paymentDate;
    generalLedger.account = req.body.bankAccount[0].id; // outstanding payments or 10020 Cash
    generalLedger.journalLabel = "Bank";
    generalLedger.reference = paymentDocument?.memo;
    generalLedger.journal = "BillPayment";
    generalLedger.journalEntry = req.params.id;
    generalLedger.entityType = "Vendor";
    generalLedger.entity = req.body.bill.vendor;
    generalLedger.label = "Vendor Payment - Rs. " + paymentDocument?.amount;
    generalLedger.debit = 0.0;
    generalLedger.credit = paymentDocument?.amount;
    generalLedgers.push(generalLedger);

    const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
    console.log("generalLedgers", generalLedgerDocument);
    if (!generalLedgerDocument) {
      return next(new AppError("Issue in creating GL documents.", 404));
    }
    //

    // Find attached bill doc and update remain amount

    const bill = await NewBill.findById(paymentDocument?.bill);

    if (!bill) {
      return next(new AppError("Issue of getting attached bill doc", 404));
    }

    res.status(200).json({
      isSuccess: true,
      status: "success",
      document: paymentDocument,
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * Title: Create bill payment
 * Request: POST
 * Routes: api/v1/billPayment
 *
 * Method description:
 * This method will accepts the body data from the client and create bill payment and within that bill payment doc attached bill
 * id.
 *
 * Changes Log:
 * 13-05-2022: Biswajit create bill payment
 *
 */
exports.createBillPayment = catchAsync(async (req, res, next) => {
  console.log("REGISTERED=>", req.body);
  let paymentObject = new Object();
  let bankAccount;

  // Find accounts needed for this method
  await Promise.all(
    (bankAccount = await Account.find({ title: "Bank" }).select("id name"))
  );

  paymentObject.journalType = "Bank";
  paymentObject.bill = req.body._id;
  paymentObject.bankAccount = bankAccount; // 1000 Bank
  // paymentObject.amount = req.body.estimation.total;
  paymentObject.amount = req.body.estimation.total;
  paymentObject.sourceDocument = req.body?.sourceDocument
    ? req.body.sourceDocument
    : null;
  paymentObject.memo = req.body.name;
  paymentObject.referenceNumber = req.body.referenceNumber;
  console.log("paymentObject: ", paymentObject);

  const paymentDocument = await BillPayment.create(paymentObject);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});

exports.createStandaloneBillPayment = catchAsync(async (req, res, next) => {
  // Find accounts needed for this method
  await Promise.all((bankAccount = await Account.find({ title: "Bank" })));

  let paymentObject = new Object();
  paymentObject.journalType = "Vendor Bill";
  paymentObject.bill = req.body.id;
  paymentObject.bankAccount = bankAccount[0]?._id;
  paymentObject.amount = req.body.remainAmountToPay;
  paymentObject.referenceNumber = req.body.referenceNumber;
  paymentObject.memo = req.body.name;
  // console.log(paymentObject);
  const paymentDocument = await BillPayment.create(paymentObject);
  if (!paymentDocument) {
    return next(new AppError("Issue in creating bill payment document.", 404));
  }

  //   const billDocument = await Bill.findByIdAndUpdate(paymentDocument.bill, {
  //     paymentStatus: "Paid",
  //   });

  // const generalLedgers = new Array();
  // let generalLedger = new Object();
  // generalLedger.date = paymentDocument.paymentDate;
  // generalLedger.account = "61b839ddd6fe795ec8bf53fc"; //paymentDocument.recepientAccount;
  // generalLedger.journalLabel = "Bank"; // Inventory Adjustment
  // generalLedger.reference = paymentDocument.memo;
  // generalLedger.journal = "BillPayment"; // InventoryAdjustment
  // generalLedger.journalEntry = paymentDocument.id;
  // generalLedger.entityType = "Vendor";
  // generalLedger.entity = req.body.vendor;
  // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
  // generalLedger.debit = paymentDocument.amount;
  // generalLedger.credit = 0.0;
  // generalLedgers.push(generalLedger);

  // generalLedger = new Object();
  // generalLedger.date = paymentDocument.paymentDate;
  // generalLedger.account = paymentDocument.bankAccount; // outstanding payments or 10020 Cash
  // generalLedger.journalLabel = "Bank";
  // generalLedger.reference = paymentDocument.memo;
  // generalLedger.journal = "BillPayment";
  // generalLedger.journalEntry = paymentDocument.id;
  // generalLedger.entityType = "Vendor";
  // generalLedger.entity = req.body.vendor;
  // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
  // generalLedger.debit = 0.0;
  // generalLedger.credit = paymentDocument.amount;
  // generalLedgers.push(generalLedger);

  // try {
  //   const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
  // } catch (error) {
  //   console.log(error);
  // }

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: paymentDocument,
  });
});

exports.findBillsById = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const documents = await BillPayment.find({ bill: req.params.id });
  console.log(documents);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: documents,
  });
});

exports.getStandalonebill = catchAsync(async (req, res, next) => {
  const documents = await Bill.find({ isStandalone: true });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: documents,
  });
});

//OLD CODE

// exports.getAllBillPayments = factory.getAll(BillPayment);
// exports.getBillPayment = factory.getOne(BillPayment, [
//   { path: "bill", select: "id name paymentStatus vendor" },
//   { path: "sourceDocument", select: "id name" },
// ]);
// // exports.createBillPayment = factory.createOne(BillPayment);
// exports.updateBillPayment = factory.updateOne(BillPayment);
// exports.deleteBillPayment = factory.deleteOne(BillPayment);

// exports.updateBillPaymentAndBill = catchAsync(async (req, res, next) => {

//   try {

//     const paymentDocument = await BillPayment.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     await Bill.findByIdAndUpdate(paymentDocument.bill, {
//       paymentStatus: "Paid",
//     });

//     console.log("paymentDocument", paymentDocument);

//     //
//     let payableAccount;

//     // Find accounts needed for this method
//     await Promise.all(
//       (payableAccount = await Account.find({ title: "Account Payable" }))
//     );

//     const generalLedgers = new Array();
//     let generalLedger = new Object();
//     generalLedger.date = paymentDocument?.paymentDate;
//     // generalLedger.account = "61c0676b4b86464aac64ba99"; //accounts payable
//     generalLedger.account = payableAccount[0]?._id; //accounts payable
//     generalLedger.journalLabel = "Bank"; // Inventory Adjustment
//     generalLedger.reference = paymentDocument?.memo;
//     generalLedger.journal = "BillPayment"; // InventoryAdjustment
//     generalLedger.journalEntry = req.params.id;
//     generalLedger.entityType = "Vendor";
//     generalLedger.entity = req.body.bill.vendor[0].id;
//     generalLedger.label = "Vendor Payment - Rs. " + paymentDocument?.amount;
//     generalLedger.debit = paymentDocument?.amount;
//     generalLedger.credit = 0.0;
//     generalLedgers.push(generalLedger);

//     generalLedger = new Object();
//     generalLedger.date = paymentDocument?.paymentDate;
//     generalLedger.account = req.body.bankAccount[0].id; // outstanding payments or 10020 Cash
//     generalLedger.journalLabel = "Bank";
//     generalLedger.reference = paymentDocument?.memo;
//     generalLedger.journal = "BillPayment";
//     generalLedger.journalEntry = req.params.id;
//     generalLedger.entityType = "Vendor";
//     generalLedger.entity = req.body.bill.vendor[0].id;
//     generalLedger.label = "Vendor Payment - Rs. " + paymentDocument?.amount;
//     generalLedger.debit = 0.0;
//     generalLedger.credit = paymentDocument?.amount;
//     generalLedgers.push(generalLedger);

//     const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
//     console.log("generalLedgers", generalLedgerDocument);
//     if (!generalLedgerDocument) {
//       return next(new AppError("Issue in creating GL documents.", 404));
//     }
//     //

//     // Find attached bill doc and update remain amount

//     const bill = await Bill.findById(paymentDocument?.bill);
//     if (!bill) {
//       return next(new AppError("Issue of getting attached bill doc", 404));
//     }

//     res.status(200).json({
//       isSuccess: true,
//       status: "success",
//       document: paymentDocument,
//     });

//   } catch (err) {
//     console.log(err);
//   }

// });

// exports.createBillPayment = catchAsync(async (req, res, next) => {
//   console.log(req.body);
//   let paymentObject = new Object();
//   let bankAccount;

//   // Find accounts needed for this method
//   await Promise.all((bankAccount = await Account.find({ title: "Bank" }).select("id name")));

//   paymentObject.journalType = "Bank";
//   paymentObject.bill = req.body._id;
//   paymentObject.bankAccount = bankAccount; // 1000 Bank
//   // paymentObject.amount = req.body.estimation.total;
//   paymentObject.amount = req.body.total;
//   paymentObject.sourceDocument = req.body.sourceDocument.id;
//   paymentObject.memo = req.body.name;
//   paymentObject.referenceNumber = req.body.referenceNumber;
//   console.log("paymentObject: ", paymentObject);

//   const paymentDocument = await BillPayment.create(paymentObject);

//   //   const billDocument = await Bill.findByIdAndUpdate(paymentDocument.bill, {
//   //     paymentStatus: "Paid",
//   //   });

//   // const generalLedgers = new Array();
//   // let generalLedger = new Object();
//   // generalLedger.date = paymentDocument.paymentDate;
//   // generalLedger.account = "61c0676b4b86464aac64ba99"; //accounts payable
//   // generalLedger.journalLabel = "Bank"; // Inventory Adjustment
//   // generalLedger.reference = paymentDocument.memo;
//   // generalLedger.journal = "BillPayment"; // InventoryAdjustment
//   // generalLedger.journalEntry = paymentDocument.id;
//   // generalLedger.entityType = "Vendor";
//   // generalLedger.entity = req.body.vendor;
//   // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
//   // generalLedger.debit = paymentDocument.amount;
//   // generalLedger.credit = 0.0;
//   // generalLedgers.push(generalLedger);

//   // generalLedger = new Object();
//   // generalLedger.date = paymentDocument.paymentDate;
//   // generalLedger.account = paymentDocument.bankAccount; // outstanding payments or 10020 Cash
//   // generalLedger.journalLabel = "Bank";
//   // generalLedger.reference = paymentDocument.memo;
//   // generalLedger.journal = "BillPayment";
//   // generalLedger.journalEntry = paymentDocument.id;
//   // generalLedger.entityType = "Vendor";
//   // generalLedger.entity = req.body.vendor;
//   // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
//   // generalLedger.debit = 0.0;
//   // generalLedger.credit = paymentDocument.amount;
//   // generalLedgers.push(generalLedger);

//   // try {
//   //   const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
//   // } catch (error) {
//   //   console.log(error);
//   // }

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     document: paymentDocument,
//   });
// });

// exports.createStandaloneBillPayment = catchAsync(async (req, res, next) => {
//   // Find accounts needed for this method
//   await Promise.all((bankAccount = await Account.find({ title: "Bank" })));

//   let paymentObject = new Object();
//   paymentObject.journalType = "Vendor Bill";
//   paymentObject.bill = req.body.id;
//   paymentObject.bankAccount = bankAccount[0]?._id;
//   paymentObject.amount = req.body.remainAmountToPay;
//   paymentObject.referenceNumber = req.body.referenceNumber;
//   paymentObject.memo = req.body.name;
//   // console.log(paymentObject);
//   const paymentDocument = await BillPayment.create(paymentObject);
//   if (!paymentDocument) {
//     return next(new AppError("Issue in creating bill payment document.", 404));
//   }

//   //   const billDocument = await Bill.findByIdAndUpdate(paymentDocument.bill, {
//   //     paymentStatus: "Paid",
//   //   });

//   // const generalLedgers = new Array();
//   // let generalLedger = new Object();
//   // generalLedger.date = paymentDocument.paymentDate;
//   // generalLedger.account = "61b839ddd6fe795ec8bf53fc"; //paymentDocument.recepientAccount;
//   // generalLedger.journalLabel = "Bank"; // Inventory Adjustment
//   // generalLedger.reference = paymentDocument.memo;
//   // generalLedger.journal = "BillPayment"; // InventoryAdjustment
//   // generalLedger.journalEntry = paymentDocument.id;
//   // generalLedger.entityType = "Vendor";
//   // generalLedger.entity = req.body.vendor;
//   // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
//   // generalLedger.debit = paymentDocument.amount;
//   // generalLedger.credit = 0.0;
//   // generalLedgers.push(generalLedger);

//   // generalLedger = new Object();
//   // generalLedger.date = paymentDocument.paymentDate;
//   // generalLedger.account = paymentDocument.bankAccount; // outstanding payments or 10020 Cash
//   // generalLedger.journalLabel = "Bank";
//   // generalLedger.reference = paymentDocument.memo;
//   // generalLedger.journal = "BillPayment";
//   // generalLedger.journalEntry = paymentDocument.id;
//   // generalLedger.entityType = "Vendor";
//   // generalLedger.entity = req.body.vendor;
//   // generalLedger.label = "Vendor Payment - Rs. " + paymentDocument.amount;
//   // generalLedger.debit = 0.0;
//   // generalLedger.credit = paymentDocument.amount;
//   // generalLedgers.push(generalLedger);

//   // try {
//   //   const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
//   // } catch (error) {
//   //   console.log(error);
//   // }

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     document: paymentDocument,
//   });
// });

// exports.findBillsById = catchAsync(async (req, res, next) => {
//   console.log(req.params.id);
//   const documents = await BillPayment.find({ bill: req.params.id });
//   console.log(documents);

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     documents: documents,
//   });
// });

// exports.getStandalonebill = catchAsync(async (req, res, next) => {
//   const documents = await Bill.find({ isStandalone: true });

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     documents: documents,
//   });
// });
