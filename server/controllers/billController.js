const AppError = require("../utils/appError");
const GeneralLedger = require("../models/generalLedgerModel");
const Account = require("../models/accountModel");
const Bill = require("../models/billModel");
const Product = require("../models/productModel");
const gstRatesOrHSN = require("../models/gstRatesModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const PurchaseOrder = require("../models/purchaseOrderModel");
const mongoose = require("mongoose");
const { Promise } = require("mongoose");
const NewBill = require("../models/billModel");

exports.getAllBills = factory.getAll(NewBill, [
  { path: "sourceDocument", select: "id purchaseOrderId name" },
  { path: "vendor", select: "id name" },
]);
exports.getBill = factory.getOne(NewBill, [
  { path: "sourceDocument", select: "id purchaseOrderId name" },
  { path: "attachedPO", select: "_id purchaseOrderId name" },
  // { path: "vendor", select: "id name" },
]);
//exports.updateBill = factory.updateOne(Bill);
exports.deleteBill = factory.deleteOne(NewBill);

/**
 * Title: Update bill
 * Request: PATCH
 * Routes: api/v1/newBill/:id
 *
 * Method description:
 * This method will accepts the body data from the client and update standalone bill. After that create GL.
 *
 * Changes Log:
 * 13-05-2022: Biswajit update bill and create GL
 * 18-05-2022: Biswajit update journal property to "NewBill"
 *
 */
exports.updateBill = catchAsync(async (req, res, next) => {
  console.log("Update Bill", req.body, req.params.id);

  // 1. Update the bill with status
  try {
    const billDocument = await NewBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    ).populate([{ path: "sourceDocument", select: "id name purchaseOrderId" }]);
    console.log("Bill Doc", billDocument);

    const generalLedgers = new Array();
    billDocument.journalItems.map((item) => {
      // console.log("ITEM=>", item)
      const generalLedger = new Object();
      generalLedger.product = item.product;
      generalLedger.account = item.account;
      generalLedger.journalLabel = "Vendor Bill";
      generalLedger.journal = "NewBill";
      generalLedger.journalEntry = billDocument._id;
      generalLedger.entityType = "Vendor";
      generalLedger.entity = billDocument.vendorArray[0]?._id;
      generalLedger.reference = billDocument.name;
      generalLedger.label = item.label;
      generalLedger.debit = item.debit;
      generalLedger.credit = item.credit;
      generalLedgers.push(generalLedger);
    });
    const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
    // console.log("",generalLedgerDocument);
    if (!generalLedgerDocument) {
      return next(new AppError("Issue in creating GL documents.", 404));
    }

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: billDocument,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.createBill = catchAsync(async (req, res, next) => {
  // 1. Load purchase order using the source document
  // 2. Need account details
  // 3. Create bill's invoice line object
  // 4. Create bill's journal item object
  // 5. Create bill object using invoice line object and journal item object
  // 6. Update purchse order with recently created bill's _id

  try {
    console.log("DATA===>", req.body);

    // 1
    const purchaseOrderDocument = await PurchaseOrder.findById(
      req.body.sourceDocument
    );

    console.log("PURCHASE ORDER", purchaseOrderDocument);

    // Variables
    let billObject = req.body;
    let invoiceLines = new Array();
    let journalItems = new Array();
    let totalAmount = 0;
    let totalTaxAmount = 0;
    let creditors;
    let receipientAccount;

    // 2. Find accounts needed for this method
    await Promise.all(
      (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
      (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
      (payableAccount = await Account.find({ title: "Account Payable" })),
      (receipientAccount = await Account.find({
        title: "Outstanding Receipts",
      }).select("id name")),
      (creditors = await Account.find({ title: "Creditors" }).select("id name"))
    );

    let products = new Array();

    if (req.body.sourceDocument) {
      await Promise.all(
        purchaseOrderDocument.products.map(async (item) => {
          if (parseInt(item.received) - parseInt(item.billed) > 0) {
            const invoiceLine = new Object();

            totalAmount +=
              (parseFloat(
                (parseInt(item.received) - parseInt(item.billed)) *
                  parseFloat(item.unitPrice)
              ) *
                parseInt(item.taxes[0])) /
                100 +
              parseFloat(
                (parseInt(item.received) - parseInt(item.billed)) *
                  parseFloat(item.unitPrice)
              );
            totalTaxAmount +=
              (parseFloat(
                (parseInt(item.received) - parseInt(item.billed)) *
                  parseFloat(item.unitPrice)
              ) *
                parseInt(item.taxes[0])) /
              100;

            console.log("Total Amount", totalAmount);
            console.log("Total Tax", totalTaxAmount);
            console.log("ONE");

            invoiceLine.product = item?.product[0]?._id;
            invoiceLine.productArray = item.product;
            invoiceLine.label =
              purchaseOrderDocument.name + ": " + item.description;
            invoiceLine.account = item.account[0]._id; //"617fd5a56fa70b36e8dde2e3";
            invoiceLine.accountArray = item.account;
            invoiceLine.unit = item.unit[0]._id;
            invoiceLine.unitArray = item.unit;
            invoiceLine.quantity =
              parseInt(item.received) - parseInt(item.billed);
            invoiceLine.taxes = item.taxes[0];
            invoiceLine.unitPrice = item.unitPrice;
            invoiceLine.subTotal =
              (parseInt(item.received) - parseInt(item.billed)) *
              parseFloat(item.unitPrice);
            invoiceLines.push(invoiceLine);

            const journalItemForDebit = new Object();
            journalItemForDebit.product = item.product[0].id;
            journalItemForDebit.accountArray = item?.account;
            journalItemForDebit.account = item?.account[0]?.id; // Account comes from Product Document;
            journalItemForDebit.label =
              purchaseOrderDocument.name + ": " + item.description;
            journalItemForDebit.debit =
              (parseInt(item.received) - parseInt(item.billed)) *
              parseFloat(item.unitPrice);
            journalItemForDebit.credit = 0.0;
            journalItems.push(journalItemForDebit);

            const journalItemForCredit = new Object();
            journalItemForCredit.product = item.product[0].id;
            journalItemForCredit.accountArray = creditors; //Accounts Payable
            journalItemForCredit.account = creditors[0]?.id; //Accounts Payable
            journalItemForCredit.debit = 0.0;
            journalItemForCredit.credit =
              (parseInt(item.received) - parseInt(item.billed)) *
              parseFloat(item.unitPrice);
            journalItems.push(journalItemForCredit);
          }

          // Purchase Order Calculation
          let product = new Object();
          product = item;
          product.billed += parseInt(item.received) - parseInt(item.billed);
          products.push(product);
        })
      );
    } else {
      //STANDALONE

      await Promise.all(
        req.body.invoiceLines.map(async (item) => {
          const invoiceLine = new Object();
          console.log(item);
          // totalAmount += (parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice)) * parseInt(item.taxes[0])) / 100 + parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice));
          // totalTaxAmount += (parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice)) * parseInt(item.taxes[0])) / 100;

          // console.log("Total Amount", totalAmount);
          // console.log("Total Tax", totalTaxAmount);
          // console.log("TWO")

          invoiceLine.product = item.productArray[0]?._id;
          invoiceLine.productArray = item.productArray;
          invoiceLine.label = item.label;
          invoiceLine.account = item.accountArray[0]._id; //"617fd5a56fa70b36e8dde2e3";
          invoiceLine.accountArray = item.accountArray;
          invoiceLine.unit = item.unitArray[0]._id;
          invoiceLine.unitArray = item.unitArray;
          invoiceLine.quantity = parseInt(item.quantity);
          invoiceLine.taxes = item.taxes;
          invoiceLine.unitPrice = item.unitPrice;
          invoiceLine.subTotal = parseInt(item.subTotal);
          invoiceLines.push(invoiceLine);

          const journalItemForDebit = new Object();
          journalItemForDebit.product = item.productArray[0].id;
          journalItemForDebit.accountArray = item?.accountArray;
          journalItemForDebit.account = item?.accountArray[0]?.id; // Account comes from Product Document;
          journalItemForDebit.label = item.label;
          journalItemForDebit.debit = parseFloat(
            parseFloat(item.subTotal) +
              (((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100) *
                2
          ).toFixed(2);
          journalItemForDebit.credit = 0.0;
          journalItems.push(journalItemForDebit);

          const journalItemForCredit = new Object();
          journalItemForCredit.product = item.productArray[0].id;
          journalItemForCredit.accountArray = creditors; //Accounts Payable
          journalItemForCredit.account = creditors[0]?.id; //Accounts Payable
          journalItemForCredit.label = item.label;
          journalItemForCredit.debit = 0.0;
          journalItemForCredit.credit = parseFloat(item.subTotal);
          journalItems.push(journalItemForCredit);

          // // Purchase Order Calculation
          // let product = new Object();
          // product = item;
          // product.billed += parseInt(item.received) - parseInt(item.billed);
          // products.push(product);
        })
      );
    }

    // billObject.sourceDocument = purchaseOrderDocument.id;
    // billObject.vendor = purchaseOrderDocument.vendor;
    // billObject.recepientAccount = receipientAccount.id;
    // billObject.totalTaxAmount = req.body?.estimation?.tax;
    // billObject.total = req.body?.estimation?.total;
    billObject.referenceNumber = req.body.referenceNumber;
    billObject.invoiceLines = invoiceLines;
    billObject.journalItems = journalItems;
    billObject.estimation = req.body?.estimation;
    if (req.body.sourceDocument) {
      billObject.isStandalone = false;
      billObject.sourceDocument = req.body.sourceDocument;
      billObject.sourceDocumentArray = req.body.sourceDocumentArray;
    } else {
      billObject.isStandalone = true;
    }

    // console.log("BILL", billObject);

    const billDocument = await NewBill.create(billObject);

    // console.log("BILL==>", billDocument)

    if (req.body.sourceDocument) {
      await PurchaseOrder.findByIdAndUpdate(
        mongoose.Types.ObjectId(purchaseOrderDocument.id),
        {
          vendorBill: billDocument.id,
          products: products,
          billingStatus: "Fully Billed",
        },
        { runValidators: false }
      );
    }

    calculateProductQty(billDocument, next, res);

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: billDocument,
    });
  } catch (err) {
    console.log(err);
  }
});

const calculateProductQty = async (billDocument, next, res) => {
  await Promise.all(
    billDocument?.invoiceLines?.map(async (e) => {
      const productDocument = await Product.findById(e.productArray[0]._id);
      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(e.productArray[0]._id, {
          // $inc: { commited: product.quantity, onHand: -product.quantity },
          $inc: {
            // commited: e.quantity,
            onHand: parseInt(e.quantity),
            available: parseInt(e.quantity),
            totalPurchasedQuantity: e.quantity,
          },
        });
      } else {
        // productObject.isAvailable = false;
        return next(
          new AppError(
            "On hand quantity is less than one in any of your selected product in the bill",
            404
          )
        );
      }
    })
  );
};

exports.findBillsByPO = catchAsync(async (req, res, next) => {
  console.log("PO" + req.params.id);
  const billDocument = await NewBill.find()
    .where("sourceDocument")
    .equals(req.params.id)
    .populate([
      { path: "vendor", select: "id name" },
      { path: "sourceDocument", select: "id name" },
    ]);
  console.log(billDocument);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: billDocument.length,
    documents: billDocument,
  });
});

exports.findOutstandingBills = catchAsync(async (req, res, next) => {
  console.log(req.query);

  const billDocument = await NewBill.find()
    .where("paymentStatus")
    .equals(req.query.paymentStatus)
    .populate([
      { path: "vendor", select: "id name" },
      { path: "sourceDocument", select: "id name" },
      { path: "recepientAccount", select: "id name" },
    ]);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: billDocument.length,
    documents: billDocument,
  });
});

/**
 * Title: Standalone bill create
 * Request: POST
 * Routes: api/v1/newBill/stansaloneBill
 *
 * Method description:
 * This method will accepts the body data from the client and create standalone bill.
 *
 * Changes Log:
 * 13-05-2022: Biswajit create standalone bill
 * 18-05-2022: Biswajit update invoiceline account data
 *
 */
exports.stansaloneBillCreate = catchAsync(async (req, res, next) => {
  //   console.log(req.body);
  let billObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();
  let sgstAccount;
  let cgstAccount;
  let payableAccount;
  let receipientAccount;

  // Find accounts needed for this method
  await Promise.all(
    (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
    (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
    (payableAccount = await Account.find({ title: "Account Payable" })),
    (receipientAccount = await Account.find({ title: "recepientAccount" }))
  );

  let hsn;
  await Promise.all(
    req.body.invoiceLines.map(async (item) => {
      const productName = await Product.findById(item?.product);

      if (!productName?.HSNSACS) {
        return next(new AppError("HSN no. is not present in product", 404));
      }

      const hsnCode = await gstRatesOrHSN.findById(productName?.HSNSACS);
      hsn = hsnCode?.name;

      const invoiceLine = new Object();
      invoiceLine.productArray = item.productArray;
      invoiceLine.product = item.product;
      invoiceLine.unitArray = item.unitArray;
      invoiceLine.unit = item.unitArray[0]._id;
      invoiceLine.label = productName?.name + ": " + item.label;
      invoiceLine.accountArray = item.accountArray;
      invoiceLine.account = item.accountArray[0]._id;
      invoiceLine.quantity = item.quantity;
      invoiceLine.hsnCode = hsn;
      invoiceLine.taxes = item.taxes;
      invoiceLine.sgst = parseFloat(item.taxes[0] / 2).toFixed(2);
      invoiceLine.cgst = parseFloat(item.taxes[0] / 2).toFixed(2);
      invoiceLine.unitPrice = item.unitPrice;
      invoiceLine.subTotal = item.subTotal;
      invoiceLines.push(invoiceLine);

      const journalItemForDebit = new Object();
      journalItemForDebit.product = item.product;
      journalItemForDebit.account = item.accountArray[0]._id;
      journalItemForDebit.accountArray = item.accountArray;
      journalItemForDebit.label = productName?.name + ": " + item.label;
      journalItemForDebit.debit = item.subTotal;
      journalItemForDebit.credit = 0.0;
      journalItems.push(journalItemForDebit);

      // SGST
      const journalItemForSGST = new Object();
      journalItemForSGST.product = item.product;
      journalItemForSGST.account = sgstAccount[0]?._id;
      journalItemForSGST.accountArray = sgstAccount;
      journalItemForSGST.label =
        "SGST Purchase " + (parseFloat(item.taxes[0]) / 2).toFixed(2) + "%";
      journalItemForSGST.debit = parseFloat(
        ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
      ).toFixed(2);
      journalItemForSGST.credit = 0.0;
      journalItems.push(journalItemForSGST);

      // CGST
      const journalItemForCGST = new Object();
      journalItemForCGST.product = item.product;
      journalItemForCGST.account = cgstAccount[0]?._id;
      journalItemForCGST.accountArray = cgstAccount;
      journalItemForCGST.label =
        "CGST Purchase " + (parseFloat(item.taxes) / 2).toFixed(2) + "%";
      journalItemForCGST.debit = parseFloat(
        ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
      ).toFixed(2);
      journalItemForCGST.credit = 0.0;
      journalItems.push(journalItemForCGST);

      const journalItemForCredit = new Object();
      journalItemForCredit.product = item.product;
      journalItemForDebit.label = productName?.name + ": " + item.label;
      journalItemForCredit.account = payableAccount[0]?._id; //creditor
      journalItemForCredit.accountArray = payableAccount; //creditor
      journalItemForCredit.debit = 0.0;
      journalItemForCredit.credit = parseFloat(
        parseFloat(item.subTotal) +
          (((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100) * 2
      ).toFixed(2);
      journalItems.push(journalItemForCredit);
    })
  );

  billObject.vendorArray = req.body.vendorArray;
  billObject.vendor = req.body.vendorArray[0]._id;
  billObject.recepientAccount = req.body.recepientAccountArray?._id;
  billObject.recepientAccountArray = req.body.recepientAccountArray;
  billObject.billDate = req.body.billDate;
  billObject.referenceNumber = req.body.referenceNumber;
  billObject.isStandalone = req.body.sourceDocumentArray?.length ? false : true;
  billObject.invoiceLines = invoiceLines;
  billObject.journalItems = journalItems;
  billObject.estimation = req.body.estimation;
  // billObject.remainAmountToPay = req.body.estimation?.total;
  billObject.total = req.body.estimation?.total;
  //   console.log(billObject);

  const billDocument = await NewBill.create(billObject);
  if (!billDocument) {
    return next(new AppError("Issue in creating bill document.", 404));
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: billDocument,
  });
});

exports.updateStansaloneBill = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // console.log(req.body);
  let billObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();

  req.body.invoiceLines.map((item) => {
    const invoiceLine = new Object();
    invoiceLine.product = item.product;
    invoiceLine.label = req.body.name + ": " + item.label;
    invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
    invoiceLine.quantity = item.quantity;
    // invoiceLine.taxes = item.taxes;
    invoiceLine.unitPrice = item.unitPrice;
    invoiceLine.subTotal = item.subTotal;
    invoiceLines.push(invoiceLine);

    const journalItemForDebit = new Object();
    journalItemForDebit.product = item.product;
    journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
    journalItemForDebit.label = req.body.name + ": " + item.label;
    journalItemForDebit.debit = item.subTotal;
    journalItemForDebit.credit = 0.0;
    journalItems.push(journalItemForDebit);

    // SGST
    const journalItemForSGST = new Object();
    journalItemForSGST.product = item.product;
    journalItemForSGST.account = "61b0608c35e2010f9cdb2c65"; //"617fd5a56fa70b36e8dde2e3";
    // journalItemForSGST.label =
    //   "SGST Purchase " + parseFloat(item.taxes) / 2 + "%";
    journalItemForSGST.debit = item.subTotal;
    //   ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100;
    journalItemForSGST.credit = 0.0;
    journalItems.push(journalItemForSGST);

    // CGST
    const journalItemForCGST = new Object();
    journalItemForCGST.product = item.product;
    journalItemForCGST.account = "61b0608c35e2010f9cdb2c64"; //"617fd5a56fa70b36e8dde2e3";
    // journalItemForCGST.label =
    //   "CGST Purchase " + parseFloat(item.taxes) / 2 + "%";
    journalItemForCGST.debit = item.subTotal;
    //   ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100;
    journalItemForCGST.credit = 0.0;
    journalItems.push(journalItemForCGST);

    const journalItemForCredit = new Object();
    journalItemForCredit.product = item.product;
    journalItemForCredit.account = "61b0608c35e2010f9cdb2c62"; //creditor
    journalItemForCredit.debit = 0.0;
    journalItemForCredit.credit = item.subTotal;
    journalItems.push(journalItemForCredit);
  });

  billObject.vendor = req.body.vendor;
  billObject.recepientAccount = req.body.recepientAccount;
  billObject.billDate = req.body.billDate;
  billObject.referenceNumber = req.body.referenceNumber;
  billObject.isStandalone = req.body.isStandalone;
  billObject.invoiceLines = invoiceLines;
  billObject.journalItems = journalItems;
  billObject.estimation = req.body.estimation;
  console.log(billObject);

  const billDocument = await NewBill.findByIdAndUpdate(
    req.body.id,
    billObject,
    {
      new: true,
    }
  );
  //   .populate([
  //     { path: "vendor", select: "id name" },
  // { path: "sourceDocument", select: "id name purchaseOrderId" },
  //   ]);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: billDocument,
  });
});

exports.getBillForPdf = catchAsync(async (req, res, next) => {
  try {
    console.log(req.params.id);
    // const bill = await Bill.aggregate([
    //   {
    //     $match: { _id: mongoose.Types.ObjectId(req.params.id) },
    //   },

    // ])
    let billDocument = await NewBill.findById(
      mongoose.Types.ObjectId(req.params.id)
    )
      .populate({
        path: "invoiceLines.product",
        project: { _id: 0 },
        select: "name",
      })
      // .populate({ path: "invoiceLines.account", select: "name" })
      .populate({ path: "sourceDocument", select: "name" });

    const invoiceLines = new Array();
    console.log(billDocument);

    billDocument.invoiceLines.map((e) => {
      const invoiceLine = new Object();
      invoiceLine.productName = e.product.name;
      invoiceLine.label = e.label;
      // invoiceLine.accountName = e.account.name;
      invoiceLine.quantity = e.quantity;
      invoiceLine.unitPrice = e.unitPrice;
      invoiceLine.taxes = e.taxes;
      invoiceLine.subTotal = e.subTotal;
      invoiceLines.push(invoiceLine);
    });

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: billDocument,
      newinvoiceLines: invoiceLines,
    });
  } catch (e) {
    console.log(e);
  }
});

exports.getStandalonebill = catchAsync(async (req, res, next) => {
  const documents = await NewBill.find({ isStandalone: true });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: documents,
  });
});

exports.getBillByName = catchAsync(async (req, res, next) => {
  console.log(req.body.name);
  const document = await NewBill.findOne({ name: req.body.name });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: document,
  });
});

exports.getunusedBill = catchAsync(async (req, res, next) => {
  const documents = await NewBill.find({
    $and: [{ isStandalone: { $eq: true } }, { isUsed: { $eq: false } }],
  });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: documents,
  });
});

//OLD CODE

// exports.getAllBills = factory.getAll(Bill, [
//   { path: "sourceDocument", select: "id purchaseOrderId name" },
//   { path: "vendor", select: "id name" },
// ]);
// exports.getBill = factory.getOne(Bill, [
//   { path: "sourceDocument", select: "id purchaseOrderId name" },
//   { path: "attachedPO", select: "_id purchaseOrderId name" },
//   // { path: "vendor", select: "id name" },
// ]);
// //exports.updateBill = factory.updateOne(Bill);
// exports.deleteBill = factory.deleteOne(Bill);

// exports.updateBill = catchAsync(async (req, res, next) => {
//   console.log("Update Bill", req.body, req.params.id)

//   // 1. Update the bill with status
//   try {

//     const billDocument = await Bill.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     }).populate([
//       { path: "sourceDocument", select: "id name purchaseOrderId" },
//     ]);
//     console.log("Bill Doc", billDocument);

//     const generalLedgers = new Array();
//     billDocument.journalItems.map((item) => {
//       const generalLedger = new Object();
//       generalLedger.product = item.product;
//       generalLedger.account = item.account[0].id;
//       generalLedger.journalLabel = "Vendor Bill";
//       generalLedger.journal = "Bill";
//       generalLedger.journalEntry = billDocument._id;
//       generalLedger.entityType = "Vendor";
//       generalLedger.entity = billDocument.vendor[0].id;
//       generalLedger.reference = billDocument.name;
//       generalLedger.label = item.label;
//       generalLedger.debit = item.debit;
//       generalLedger.credit = item.credit;
//       generalLedgers.push(generalLedger);
//     });
//     const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
//     // console.log(generalLedgerDocument);
//     if (!generalLedgerDocument) {
//       return next(new AppError("Issue in creating GL documents.", 404));
//     }

//     res.status(201).json({
//       isSuccess: true,
//       status: "success",
//       document: billDocument,
//     });

//   } catch (err) {

//     console.log(err);

//   }
// });

// exports.createBill = catchAsync(async (req, res, next) => {
//   // 1. Load purchase order using the source document
//   // 2. Need account details
//   // 3. Create bill's invoice line object
//   // 4. Create bill's journal item object
//   // 5. Create bill object using invoice line object and journal item object
//   // 6. Update purchse order with recently created bill's _id

//   try {

//     // if (Array.isArray(req.body.sourceDocument)) {
//     //   console.log("if")
//     // } else {
//     //   console.log("else")
//     // }
//     // const isStandalone = !req.body.sourceDocument;

//     // if (!isStandalone) {
//     //   // From Purchase Order

//     //   const purchaseOrderDocument = await PurchaseOrder.findById(
//     //     req.body.sourceDocument[0].id
//     //   );
//     //   console.log(purchaseOrderDocument)

//     // } else {
//     //   // Standalone Bill
//     //   console.log("Else")

//     // }

//     // 1
//     const purchaseOrderDocument = await PurchaseOrder.findById(
//       req.body.sourceDocument
//     );

//     // Variables
//     let billObject = new Object();
//     let invoiceLines = new Array();
//     let journalItems = new Array();
//     let totalAmount = 0;
//     let totalTaxAmount = 0;
//     let creditors;
//     let receipientAccount;

//     // 2. Find accounts needed for this method
//     await Promise.all(
//       (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
//       (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
//       (payableAccount = await Account.find({ title: "Account Payable" })),
//       (receipientAccount = await Account.find({ title: "Outstanding Receipts" }).select("id name")),
//       (creditors = await Account.find({ title: "Creditors" }).select("id name"))
//     );

//     let products = new Array();
//     await Promise.all(
//       purchaseOrderDocument.products.map((item) => {

//         if (parseInt(item.received) - parseInt(item.billed) > 0) {
//           const invoiceLine = new Object();

//           totalAmount += (parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice)) * parseInt(item.taxes[0])) / 100 + parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice));
//           totalTaxAmount += (parseFloat((parseInt(item.received) - parseInt(item.billed)) * parseFloat(item.unitPrice)) * parseInt(item.taxes[0])) / 100;

//           console.log("Total Amount", totalAmount);
//           console.log("Total Tax", totalTaxAmount);

//           invoiceLine.product = item.product;
//           invoiceLine.label = purchaseOrderDocument.name + ": " + item.description;
//           invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//           invoiceLine.quantity = parseInt(item.received) - parseInt(item.billed);
//           invoiceLine.taxes = item.taxes[0];
//           invoiceLine.unitPrice = item.unitPrice;
//           invoiceLine.subTotal =
//             (parseInt(item.received) - parseInt(item.billed)) *
//             parseFloat(item.unitPrice);
//           invoiceLines.push(invoiceLine);

//           const journalItemForDebit = new Object();
//           journalItemForDebit.product = item.product[0].id;
//           journalItemForDebit.account = item.account; // Account comes from Product Document;
//           journalItemForDebit.label =
//             purchaseOrderDocument.name + ": " + item.description;
//           journalItemForDebit.debit =
//             (parseInt(item.received) - parseInt(item.billed)) *
//             parseFloat(item.unitPrice);
//           journalItemForDebit.credit = 0.0;
//           journalItems.push(journalItemForDebit);

//           const journalItemForCredit = new Object();
//           journalItemForCredit.product = item.product[0].id;
//           journalItemForCredit.account = creditors; //Accounts Payable
//           journalItemForCredit.debit = 0.0;
//           journalItemForCredit.credit =
//             (parseInt(item.received) - parseInt(item.billed)) *
//             parseFloat(item.unitPrice);
//           journalItems.push(journalItemForCredit);

//         }

//         // Purchase Order Calculation
//         let product = new Object();
//         product = item;
//         product.billed += parseInt(item.received) - parseInt(item.billed);
//         products.push(product);

//       })
//     );

//     billObject.sourceDocument = purchaseOrderDocument.id;
//     billObject.vendor = purchaseOrderDocument.vendor;
//     billObject.recepientAccount = receipientAccount;
//     billObject.invoiceLines = invoiceLines;
//     billObject.journalItems = journalItems;
//     billObject.totalTaxAmount = totalTaxAmount;
//     billObject.total = totalAmount;
//     billObject.estimation = purchaseOrderDocument.estimation;

//     console.log("BILL", billObject);

//     const billDocument = await Bill.create(billObject);

//     await PurchaseOrder.findByIdAndUpdate(
//       mongoose.Types.ObjectId(purchaseOrderDocument.id),
//       { vendorBill: billDocument.id, products: products },
//       {
//         runValidators: false,
//       }
//     );

//     res.status(201).json({
//       isSuccess: true,
//       status: "success",
//       document: billDocument,
//     });

//   } catch (err) {
//     //console.log(err)
//   }

// });

// exports.findBillsByPO = catchAsync(async (req, res, next) => {
//   console.log("PO" + req.params.id);
//   const billDocument = await Bill.find()
//     .where("sourceDocument")
//     .equals(req.params.id)
//     .populate([
//       { path: "vendor", select: "id name" },
//       { path: "sourceDocument", select: "id name" },
//     ]);
//   console.log(billDocument);

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     results: billDocument.length,
//     documents: billDocument,
//   });
// });

// exports.findOutstandingBills = catchAsync(async (req, res, next) => {
//   console.log(req.query);

//   const billDocument = await Bill.find()
//     .where("paymentStatus")
//     .equals(req.query.paymentStatus)
//     .populate([
//       { path: "vendor", select: "id name" },
//       { path: "sourceDocument", select: "id name" },
//       { path: "recepientAccount", select: "id name" },
//     ]);

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     results: billDocument.length,
//     documents: billDocument,
//   });
// });

// exports.stansaloneBillCreate = catchAsync(async (req, res, next) => {
//   //   console.log(req.body);
//   let billObject = new Object();
//   let invoiceLines = new Array();
//   let journalItems = new Array();
//   let sgstAccount;
//   let cgstAccount;
//   let payableAccount;
//   let receipientAccount;

//   // Find accounts needed for this method
//   await Promise.all(
//     (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
//     (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
//     (payableAccount = await Account.find({ title: "Account Payable" })),
//     (receipientAccount = await Account.find({ title: "recepientAccount" }))
//   );

//   let hsn;
//   await Promise.all(
//     req.body.invoiceLines.map(async (item) => {
//       const productName = await Product.findById(item?.product);

//       const hsnCode = await gstRatesOrHSN.findById(productName?.HSNSACS);
//       hsn = hsnCode?.name;

//       const invoiceLine = new Object();
//       invoiceLine.product = item.product;
//       invoiceLine.label = productName?.name + ": " + item.label;
//       invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//       invoiceLine.quantity = item.quantity;
//       invoiceLine.hsnCode = hsn;
//       invoiceLine.taxes = item.taxes;
//       invoiceLine.sgst = parseInt(item.taxes / 2);
//       invoiceLine.cgst = parseInt(item.taxes / 2);
//       invoiceLine.unitPrice = item.unitPrice;
//       invoiceLine.subTotal = item.subTotal;
//       invoiceLines.push(invoiceLine);

//       const journalItemForDebit = new Object();
//       journalItemForDebit.product = item.product;
//       journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//       journalItemForDebit.label = productName?.name + ": " + item.label;
//       journalItemForDebit.debit = item.subTotal;
//       journalItemForDebit.credit = 0.0;
//       journalItems.push(journalItemForDebit);

//       // SGST
//       const journalItemForSGST = new Object();
//       journalItemForSGST.product = item.product;
//       journalItemForSGST.account = sgstAccount[0]?._id; //"617fd5a56fa70b36e8dde2e3";
//       // journalItemForSGST.label =
//       //   "SGST Purchase " + parseFloat(item.taxes) / 2 + "%";
//       journalItemForSGST.debit = parseFloat(
//         ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
//       ).toFixed(2);
//       journalItemForSGST.credit = 0.0;
//       journalItems.push(journalItemForSGST);

//       // CGST
//       const journalItemForCGST = new Object();
//       journalItemForCGST.product = item.product;
//       journalItemForCGST.account = cgstAccount[0]?._id; //"617fd5a56fa70b36e8dde2e3";
//       // journalItemForCGST.label =
//       //   "CGST Purchase " + parseFloat(item.taxes) / 2 + "%";
//       journalItemForCGST.debit = parseFloat(
//         ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
//       ).toFixed(2);
//       journalItemForCGST.credit = 0.0;
//       journalItems.push(journalItemForCGST);

//       const journalItemForCredit = new Object();
//       journalItemForCredit.product = item.product;
//       journalItemForCredit.account = payableAccount[0]?._id; //creditor
//       journalItemForCredit.debit = 0.0;
//       journalItemForCredit.credit = parseFloat(
//         parseFloat(item.subTotal) +
//         (((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100) * 2
//       ).toFixed(2);
//       journalItems.push(journalItemForCredit);
//     })
//   );

//   billObject.vendor = req.body.vendor;
//   billObject.recepientAccount = receipientAccount[0]?._id;
//   billObject.billDate = req.body.billDate;
//   billObject.referenceNumber = req.body.referenceNumber;
//   billObject.isStandalone = req.body.isStandalone;
//   billObject.invoiceLines = invoiceLines;
//   billObject.journalItems = journalItems;
//   billObject.estimation = req.body.estimation;
//   // billObject.remainAmountToPay = req.body.estimation?.total;
//   billObject.total = req.body.estimation?.total;
//   //   console.log(billObject);

//   const billDocument = await Bill.create(billObject);
//   if (!billDocument) {
//     return next(new AppError("Issue in creating bill document.", 404));
//   }

//   res.status(201).json({
//     isSuccess: true,
//     status: "success",
//     document: billDocument,
//   });
// });

// exports.updateStansaloneBill = catchAsync(async (req, res, next) => {
//   console.log(req.body);
//   // console.log(req.body);
//   let billObject = new Object();
//   let invoiceLines = new Array();
//   let journalItems = new Array();

//   req.body.invoiceLines.map((item) => {
//     const invoiceLine = new Object();
//     invoiceLine.product = item.product;
//     invoiceLine.label = req.body.name + ": " + item.label;
//     invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//     invoiceLine.quantity = item.quantity;
//     // invoiceLine.taxes = item.taxes;
//     invoiceLine.unitPrice = item.unitPrice;
//     invoiceLine.subTotal = item.subTotal;
//     invoiceLines.push(invoiceLine);

//     const journalItemForDebit = new Object();
//     journalItemForDebit.product = item.product;
//     journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//     journalItemForDebit.label = req.body.name + ": " + item.label;
//     journalItemForDebit.debit = item.subTotal;
//     journalItemForDebit.credit = 0.0;
//     journalItems.push(journalItemForDebit);

//     // SGST
//     const journalItemForSGST = new Object();
//     journalItemForSGST.product = item.product;
//     journalItemForSGST.account = "61b0608c35e2010f9cdb2c65"; //"617fd5a56fa70b36e8dde2e3";
//     // journalItemForSGST.label =
//     //   "SGST Purchase " + parseFloat(item.taxes) / 2 + "%";
//     journalItemForSGST.debit = item.subTotal;
//     //   ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100;
//     journalItemForSGST.credit = 0.0;
//     journalItems.push(journalItemForSGST);

//     // CGST
//     const journalItemForCGST = new Object();
//     journalItemForCGST.product = item.product;
//     journalItemForCGST.account = "61b0608c35e2010f9cdb2c64"; //"617fd5a56fa70b36e8dde2e3";
//     // journalItemForCGST.label =
//     //   "CGST Purchase " + parseFloat(item.taxes) / 2 + "%";
//     journalItemForCGST.debit = item.subTotal;
//     //   ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100;
//     journalItemForCGST.credit = 0.0;
//     journalItems.push(journalItemForCGST);

//     const journalItemForCredit = new Object();
//     journalItemForCredit.product = item.product;
//     journalItemForCredit.account = "61b0608c35e2010f9cdb2c62"; //creditor
//     journalItemForCredit.debit = 0.0;
//     journalItemForCredit.credit = item.subTotal;
//     journalItems.push(journalItemForCredit);
//   });

//   billObject.vendor = req.body.vendor;
//   billObject.recepientAccount = req.body.recepientAccount;
//   billObject.billDate = req.body.billDate;
//   billObject.referenceNumber = req.body.referenceNumber;
//   billObject.isStandalone = req.body.isStandalone;
//   billObject.invoiceLines = invoiceLines;
//   billObject.journalItems = journalItems;
//   billObject.estimation = req.body.estimation;
//   console.log(billObject);

//   const billDocument = await Bill.findByIdAndUpdate(req.body.id, billObject, {
//     new: true,
//   });
//   //   .populate([
//   //     { path: "vendor", select: "id name" },
//   // { path: "sourceDocument", select: "id name purchaseOrderId" },
//   //   ]);

//   res.status(201).json({
//     isSuccess: true,
//     status: "success",
//     document: billDocument,
//   });
// });

// exports.getBillForPdf = catchAsync(async (req, res, next) => {
//   try {
//     console.log(req.params.id);
//     // const bill = await Bill.aggregate([
//     //   {
//     //     $match: { _id: mongoose.Types.ObjectId(req.params.id) },
//     //   },

//     // ])
//     let billDocument = await Bill.findById(
//       mongoose.Types.ObjectId(req.params.id)
//     )
//       .populate({
//         path: "invoiceLines.product",
//         project: { _id: 0 },
//         select: "name",
//       })
//       // .populate({ path: "invoiceLines.account", select: "name" })
//       .populate({ path: "sourceDocument", select: "name" });

//     const invoiceLines = new Array();
//     console.log(billDocument);

//     billDocument.invoiceLines.map((e) => {
//       const invoiceLine = new Object();
//       invoiceLine.productName = e.product.name;
//       invoiceLine.label = e.label;
//       // invoiceLine.accountName = e.account.name;
//       invoiceLine.quantity = e.quantity;
//       invoiceLine.unitPrice = e.unitPrice;
//       invoiceLine.taxes = e.taxes;
//       invoiceLine.subTotal = e.subTotal;
//       invoiceLines.push(invoiceLine);
//     });

//     res.status(201).json({
//       isSuccess: true,
//       status: "success",
//       document: billDocument,
//       newinvoiceLines: invoiceLines,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// });

// exports.getStandalonebill = catchAsync(async (req, res, next) => {
//   const documents = await Bill.find({ isStandalone: true });

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     documents: documents,
//   });
// });

// exports.getBillByName = catchAsync(async (req, res, next) => {
//   console.log(req.body.name);
//   const document = await Bill.findOne({ name: req.body.name });

//   res.status(200).json({
//     isSuccess: true,
//     status: "success",
//     document: document,
//   });
// });
