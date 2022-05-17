const AppError = require("../utils/appError");
const GeneralLedger = require("../models/generalLedgerModel");
const Invoice = require("../models/invoiceModel");
const Account = require("../models/accountModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const SalesOrder = require("../models/salesOrderModel");
const mongoose = require("mongoose");
const { Promise } = require("mongoose");
const Product = require("../models/productModel");

exports.getAllInvoices = factory.getAll(Invoice, [
  { path: "sourceDocument", select: "id salesOrderId name" },
  { path: "customer", select: "id name" },
]);
exports.getInvoice = factory.getOne(Invoice, [
  { path: "sourceDocument", select: "id salesOrderId name" },
]);
//exports.updateInvoice = factory.updateOne(Invoice);
exports.deleteInvoice = factory.deleteOne(Invoice);

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoiceDocument = await Invoice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate([
    // { path: "customer", select: "id name" },
    { path: "sourceDocument", select: "id name salesOrderId" },
  ]);

  const generalLedgers = new Array();

  invoiceDocument.journalItems.map((item) => {
    const generalLedger = new Object();
    generalLedger.product = item.product;
    generalLedger.account = item.account;
    generalLedger.journalLabel = "Customer Invoice";
    generalLedger.journal = "Invoice";
    generalLedger.journalEntry = invoiceDocument.id;
    generalLedger.entityType = "Customer";
    generalLedger.entity = invoiceDocument.customer;
    generalLedger.reference = invoiceDocument.name;
    generalLedger.label = item.label;
    generalLedger.debit = item.debit;
    generalLedger.credit = item.credit;
    generalLedgers.push(generalLedger);
  });
  const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
  console.log(generalLedgerDocument);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: invoiceDocument,
  });
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  try {
    const salesOrderDocument = await SalesOrder.findById(
      req.body.sourceDocument
    );

    let invoiceObject = new Object();
    let invoiceLines = new Array();
    let journalItems = new Array();
    let products = new Array();
    let sgstAccount;
    let cgstAccount;
    let receivableAccount;
    let receipientAccount;
    let tot = 0;
    let totTaxAmount = 0;
    let subtot = 0;

    // Find accounts needed for this method
    await Promise.all(
      (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
      (cgstAccount = await Account.find({ title: "CGST PAYABLE" }).select(
        "id name"
      )),
      (receivableAccount = await Account.find({
        title: "Account Receivable",
      }).select("id name")),
      (receipientAccount = await Account.find({
        title: "Outstanding Payments",
      }).select("id name"))
    );

    console.log(receipientAccount);

    await Promise.all(
      salesOrderDocument.products.map(async (item) => {
        console.log(item);
        if (parseInt(item.delivered) - parseInt(item.invoiced) > 0) {
          const productDocument = await Product.findById(item.product);

          //
          tot +=
            (parseFloat(
              (parseInt(item.delivered) - parseInt(item.invoiced)) *
                parseFloat(item.unitPrice)
            ) *
              parseInt(item.taxes[0])) /
              100 +
            parseFloat(
              (parseInt(item.delivered) - parseInt(item.invoiced)) *
                parseFloat(item.unitPrice)
            );
          totTaxAmount +=
            (parseFloat(
              (parseInt(item.delivered) - parseInt(item.invoiced)) *
                parseFloat(item.unitPrice)
            ) *
              parseInt(item.taxes[0])) /
            100;
          //
          console.log(tot);
          console.log(totTaxAmount);

          // Create Invoice lines
          const invoiceLine = new Object();
          invoiceLine.product = item.product;
          invoiceLine.label = salesOrderDocument.name + ": " + item.description;
          invoiceLine.account = cgstAccount;
          invoiceLine.quantity =
            parseInt(item.delivered) - parseInt(item.invoiced);
          invoiceLine.taxes = item.taxes;
          invoiceLine.unitPrice = item.unitPrice;
          invoiceLine.subTotal = parseFloat(
            (parseInt(item.delivered) - parseInt(item.invoiced)) *
              parseFloat(item.unitPrice)
          ).toFixed(2);
          invoiceLines.push(invoiceLine);

          // Creating journal lines
          // Credit calculation
          // let journalItemForCredit = new Object();
          // journalItemForCredit.product = item.product;
          // journalItemForCredit.account = productDocument.incomeAccount; // 4000 Sales
          // journalItemForCredit.label =
          //   salesOrderDocument.name + ": " + item.description;
          // journalItemForCredit.debit = 0.0;
          // journalItemForCredit.credit = item.subTotal;
          // journalItems.push(journalItemForCredit);

          journalItemForCredit = new Object();
          journalItemForCredit.product = item.product;
          journalItemForCredit.account = productDocument.assetAccount; // 12100 Inventory Asset
          journalItemForCredit.label =
            salesOrderDocument.name + ": " + item.description;
          journalItemForCredit.debit = 0.0;
          journalItemForCredit.credit = parseFloat(
            (parseInt(item.delivered) - parseInt(item.invoiced)) *
              parseFloat(item.unitPrice)
          ).toFixed(2);
          // parseFloat(item.quantity) * parseFloat(productDocument.cost);
          journalItems.push(journalItemForCredit);

          // Debit Calculation
          let journalItemForDebit = new Object();
          journalItemForDebit.product = item.product;
          // journalItemForDebit.account = "61b839ddd6fe795ec8bf53fa"; // 13000 Account receivable
          journalItemForDebit.account = receivableAccount; // 13000 Account receivable
          journalItemForDebit.debit = parseFloat(
            (parseInt(item.delivered) - parseInt(item.invoiced)) *
              parseFloat(item.unitPrice)
          ).toFixed(2);
          // console.log(s);
          // console.log(
          //   s + parseFloat(((parseInt(item.taxes) / 2) * parseFloat(s)) / 100) * 2
          // );
          // parseFloat(item.delivered) * parseFloat(item.unitPrice) +
          // ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100 +
          // ((parseInt(item.taxes) / 2) * parseFloat(item.unitPrice)) / 100;
          journalItemForDebit.credit = 0.0;
          journalItems.push(journalItemForDebit);

          // journalItemForDebit = new Object();
          // journalItemForDebit.product = item.product;
          // journalItemForDebit.account = "61b839ddd6fe795ec8bf53fb"; // 5000 COGS
          // journalItemForDebit.debit =
          //   parseFloat(item.quantity) * parseFloat(productDocument.cost);
          // journalItemForDebit.credit = 0.0;
          // journalItems.push(journalItemForDebit);
        }

        let product = new Object();
        product = item;
        product.invoiced += parseInt(item.delivered) - parseInt(item.invoiced);
        products.push(product);
      })
    );

    invoiceObject.sourceDocument = salesOrderDocument.id;
    invoiceObject.customer = salesOrderDocument.customer;
    // invoiceObject.recepientAccount = "61b839ddd6fe795ec8bf53fc";
    invoiceObject.recepientAccount = receipientAccount;
    invoiceObject.invoiceLines = invoiceLines;
    invoiceObject.journalItems = journalItems;
    invoiceObject.estimation = salesOrderDocument.estimation;
    invoiceObject.total = tot;
    invoiceObject.totalTaxAmount = totTaxAmount;

    // console.log(invoiceObject);

    const invoiceDocument = await Invoice.create(invoiceObject);

    await SalesOrder.findByIdAndUpdate(
      mongoose.Types.ObjectId(salesOrderDocument.id),
      { customerInvoice: invoiceDocument.id, products: products },
      {
        runValidators: false,
      }
    );

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: invoiceDocument,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.findInvoicesBySO = catchAsync(async (req, res, next) => {
  console.log("PO" + req.params.id);
  const invoiceDocument = await Invoice.find()
    .where("sourceDocument")
    .equals(req.params.id)
    .populate([
      { path: "customer", select: "id name" },
      { path: "sourceDocument", select: "id name" },
    ]);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: invoiceDocument.length,
    documents: invoiceDocument,
  });
});

exports.findOutstandinginvoices = catchAsync(async (req, res, next) => {
  const invoiceDocument = await Invoice.find()
    .where("paymentStatus")
    .equals(req.query.paymentStatus)
    .populate([
      { path: "customer", select: "id name" },
      { path: "sourceDocument", select: "id name" },
      { path: "recepientAccount", select: "id name" },
    ]);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: invoiceDocument.length,
    documents: invoiceDocument,
  });
});

exports.createStandaloneInv = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  let invoiceObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();

  //   console.log("createStandaloneInv: ", req.body);
  req.body.invoiceLines.map((item) => {
    const invoiceLine = new Object();
    invoiceLine.product = item.product;
    invoiceLine.label = req.body.name + ": " + item.label;
    invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
    invoiceLine.quantity = parseInt(item.quantity);
    invoiceLine.taxes = item.taxes;
    invoiceLine.unitPrice = item.unitPrice;
    invoiceLine.subTotal = item.subTotal;
    invoiceLines.push(invoiceLine);

    const journalItemForCredit = new Object();
    journalItemForCredit.product = item.product;
    journalItemForCredit.account = "61b839ddd6fe795ec8bf53fb"; //product.account; //"617fd5a56fa70b36e8dde2e3";
    journalItemForCredit.label = req.body.name + ": " + item.label;
    journalItemForCredit.debit = 0.0;
    journalItemForCredit.credit = item.subTotal;
    journalItems.push(journalItemForCredit);

    const journalItemForDebit = new Object();
    journalItemForDebit.product = item.product;
    journalItemForDebit.account = "61b839ddd6fe795ec8bf53f6"; // Debtors
    journalItemForCredit.label = req.body.name + ": " + item.label;
    journalItemForDebit.debit = item.subTotal;
    journalItemForDebit.credit = 0.0;
    journalItems.push(journalItemForDebit);
  });

  invoiceObject.customer = req.body.customer;
  invoiceObject.recepientAccount = req.body.recepientAccount;
  // invoiceObject.recepientAccount = req.body.recepientAccount;
  //   invoiceObject.total = req.body.total;
  invoiceObject.isStandalone = req.body.isStandalone;
  invoiceObject.invoiceLines = invoiceLines;
  invoiceObject.journalItems = journalItems;
  invoiceObject.estimation = req.body.estimation;
  console.log(invoiceObject);

  let invoiceDocument;
  try {
    invoiceDocument = await Invoice.create(invoiceObject);
    console.log("invoiceDocument", invoiceDocument);

    await Promise.all(
      invoiceDocument?.invoiceLines?.map(async (e) => {
        const productDocument = await Product.findById(e.product);
        if (productDocument.onHand > 0) {
          await Product.findByIdAndUpdate(e.product, {
            // $inc: { commited: product.quantity, onHand: -product.quantity },
            $inc: {
              commited: e.quantity,
              onHand: -parseInt(e.quantity),
              available: -parseInt(e.quantity),
              totalSoldQuantity: e.quantity,
            },
          });
        } else {
          productObject.isAvailable = false;
        }
      })
    );
  } catch (e) {
    console.log(e);
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: invoiceDocument,
  });
});

exports.updateStandaloneInv = catchAsync(async (req, res, next) => {
  let invoiceObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();

  req.body.invoiceLines.map((item) => {
    const invoiceLine = new Object();
    invoiceLine.product = item.product;
    invoiceLine.label = req.body.name + ": " + item.label;
    invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
    invoiceLine.quantity = parseInt(item.quantity);
    invoiceLine.taxes = item.taxes;
    invoiceLine.unitPrice = item.unitPrice;
    invoiceLine.subTotal = item.subTotal;
    invoiceLines.push(invoiceLine);

    const journalItemForCredit = new Object();
    journalItemForCredit.product = item.product;
    journalItemForCredit.account = "61b839ddd6fe795ec8bf53fb"; //product.account; //"617fd5a56fa70b36e8dde2e3";
    journalItemForCredit.label = req.body.name + ": " + item.label;
    journalItemForCredit.debit = 0.0;
    journalItemForCredit.credit = item.subTotal;
    journalItems.push(journalItemForCredit);

    const journalItemForDebit = new Object();
    journalItemForDebit.product = item.product;
    journalItemForDebit.account = "61b839ddd6fe795ec8bf53f6"; // Debtors
    journalItemForCredit.label = req.body.name + ": " + item.label;
    journalItemForDebit.debit = item.subTotal;
    journalItemForDebit.credit = 0.0;
    journalItems.push(journalItemForDebit);
  });

  invoiceObject.customer = req.body.customer;
  invoiceObject.recepientAccount = req.body.recepientAccount;
  // invoiceObject.recepientAccount = req.body.recepientAccount;
  //   invoiceObject.total = req.body.total;
  invoiceObject.isStandalone = req.body.isStandalone;
  invoiceObject.invoiceLines = invoiceLines;
  invoiceObject.journalItems = journalItems;
  invoiceObject.estimation = req.body.estimation;

  const invoiceDocument = await Invoice.findByIdAndUpdate(
    req.params.id,
    // req.body,
    invoiceObject,
    { new: true }
  );
  //   .populate([{ path: "customer", select: "id name" }]);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: invoiceDocument,
  });
});

exports.getInvoiceForPdf = catchAsync(async (req, res, next) => {
  try {
    console.log(req.params.id);
    // const bill = await Bill.aggregate([
    //   {
    //     $match: { _id: mongoose.Types.ObjectId(req.params.id) },
    //   },

    // ])
    const invDocument = await Invoice.findById(
      mongoose.Types.ObjectId(req.params.id)
    )
      .populate({
        path: "invoiceLines.product",
        select: "name",
      })
      .populate({
        path: "customer",
        select: "id name address",
      });

    console.log(invDocument);
    const invoiceLines = new Array();

    invDocument.invoiceLines.map((e) => {
      const invoiceLine = new Object();
      invoiceLine.productName = e.product.name;
      invoiceLine.label = e.label;
      invoiceLine.quantity = e.quantity;
      invoiceLine.unitPrice = e.unitPrice;
      invoiceLine.taxes = e.taxes;
      invoiceLine.subTotal = e.subTotal;
      invoiceLines.push(invoiceLine);
    });

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: invDocument,
      newinvoiceLines: invoiceLines,
    });
  } catch (e) {
    console.log(e);
  }
});
