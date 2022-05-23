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
const CustomAppError = require("../utils/customAppError");

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
  );
  // .populate([
  //   // { path: "customer", select: "id name" },
  //   { path: "sourceDocument", select: "id name salesOrderId" },
  // ]);

  const generalLedgers = new Array();

  invoiceDocument.journalItems.map((item) => {
    const generalLedger = new Object();
    generalLedger.product = item.product[0]._id;
    generalLedger.account = item.account[0]._id;
    generalLedger.journalLabel = "Customer Invoice";
    generalLedger.journal = "Invoice";
    generalLedger.journalEntry = invoiceDocument.id;
    generalLedger.entityType = "Customer";
    generalLedger.entity = invoiceDocument.customer[0]._id;
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
        title: "Account receivable",
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
          invoiceLine.unit = item.unit;
          invoiceLine.quantity =
            parseInt(item.delivered) - parseInt(item.invoiced);
          invoiceLine.taxes = item.taxes;
          invoiceLine.unitPrice = item.unitPrice;
          invoiceLine.subTotal = parseFloat(
            (parseInt(item.delivered) - parseInt(item.invoiced)) *
              parseFloat(item.unitPrice)
          ).toFixed(2);
          invoiceLines.push(invoiceLine);

          //Credit calculation
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
          journalItemForDebit.account = receivableAccount; // 13000 Account receivable
          journalItemForDebit.debit = parseFloat(
            parseFloat(item.subTotal) +
              (((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100) *
                2
          ).toFixed(2);
          journalItemForDebit.credit = 0.0;
          journalItems.push(journalItemForDebit);

          // journalItemForDebit = new Object();
          // journalItemForDebit.product = item.product;
          // journalItemForDebit.account = "61b839ddd6fe795ec8bf53fb"; // 5000 COGS
          // journalItemForDebit.debit =
          //   parseFloat(item.quantity) * parseFloat(productDocument.cost);
          // journalItemForDebit.credit = 0.0;
          // journalItems.push(journalItemForDebit);

          // SGST
          const journalItemForSGST = new Object();
          journalItemForSGST.product = item.product;
          journalItemForSGST.account = sgstAccount; //"617fd5a56fa70b36e8dde2e3";
          journalItemForSGST.label = item.label;
          journalItemForSGST.debit = parseFloat(
            ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
          ).toFixed(2);
          journalItemForSGST.credit = 0.0;
          journalItems.push(journalItemForSGST);

          // CGST
          const journalItemForCGST = new Object();
          journalItemForCGST.product = item.product;
          journalItemForCGST.account = cgstAccount; //"617fd5a56fa70b36e8dde2e3";
          journalItemForCGST.label = item.label;
          journalItemForCGST.debit = parseFloat(
            ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
          ).toFixed(2);
          journalItemForCGST.credit = 0.0;
          journalItems.push(journalItemForCGST);
        }

        let product = new Object();
        product = item;
        product.invoiced += parseInt(item.delivered) - parseInt(item.invoiced);
        products.push(product);
      })
    );

    //Format array of obj for sourceDocument
    let obj = new Object();
    obj._id = salesOrderDocument._id;
    obj.name = salesOrderDocument.name;
    obj.id = salesOrderDocument.id;

    invoiceObject.sourceDocument = [obj];
    invoiceObject.customer = salesOrderDocument.customer;
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
      { customerInvoice: invoiceDocument._id, products: products },
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
    .where("sourceDocument.id")
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
  /*
  *1. Declare needed variables
  *2. Find accounts needed for this method
  *2. Check if sourceDocument present in req.body. If present create the invoice as non-standalone else standalone.
  *3. If it is created as non-standalone then, Update SO's invoiceStatus to "Fully Invoiced" and set the invoice id in 
      attached SO
  */

  let invObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();
  let array = new Array();
  let receivableAccount;
  let invoiceDocument;

  await Promise.all(
    (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
    (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
    (receivableAccount = await Account.find({ title: "Account receivable" }))
  );

  // console.log("createStandaloneInv: ", req.body);

  if (req.body.sourceDocument?.length) {
    // non-standalone
    invObject = formatinvoiceLinesAndJournalItems(
      req.body,
      req.body.invoiceLines,
      sgstAccount,
      cgstAccount,
      receivableAccount,
      next,
      res
    );

    try {
      invoiceDocument = await Invoice.create(invObject);
      calculateProductQty(invoiceDocument, next, res);
    } catch (e) {
      console.log(e);
    }

    console.log("invoiceDocument: ", invoiceDocument);
    if (invoiceDocument) {
      // Update SO's invoiceStatus to "Fully Invoiced" and set the invoice id in attached SO
      await SalesOrder.findByIdAndUpdate(
        mongoose.Types.ObjectId(invoiceDocument.sourceDocument[0]?._id),
        {
          invoiceStatus: "Fully Invoiced",
          customerInvoice: invoiceDocument._id,
        },
        { new: true }
      );

      // Update SO's each product invoiced field
      const SO = await SalesOrder.findById(
        mongoose.Types.ObjectId(invoiceDocument.sourceDocument[0]?._id)
      );
      await Promise.all(
        SO.products.map((e) => {
          let obj = e;
          obj.invoiced = e.delivered;
          array.push(obj);
        })
      );

      await SalesOrder.findByIdAndUpdate(
        mongoose.Types.ObjectId(SO._id),
        {
          products: array,
        },
        { new: true }
      );
    }
  } else {
    // standalone
    invObject = formatinvoiceLinesAndJournalItems(
      req.body,
      req.body.invoiceLines,
      sgstAccount,
      cgstAccount,
      receivableAccount,
      next,
      res
    );

    try {
      invoiceDocument = await Invoice.create(invObject);

      calculateProductQty(invoiceDocument, next, res);
    } catch (e) {
      console.log(e);
    }
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: invoiceDocument,
  });
});

// Format invoice lines and journal items and create Invoice. Then calculate each item's quantity and set it to that item's.
const formatinvoiceLinesAndJournalItems = (
  body,
  invLines,
  sgstAccount,
  cgstAccount,
  receivableAccount,
  next,
  res
) => {
  let invoiceObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();

  invLines.map((item) => {
    const invoiceLine = new Object();
    invoiceLine.product = item.product;
    invoiceLine.label = item.label;
    invoiceLine.unit = item.unit;
    invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
    invoiceLine.quantity = parseInt(item.quantity);
    invoiceLine.taxes = item.taxes;
    invoiceLine.unitPrice = item.unitPrice;
    invoiceLine.subTotal = item.subTotal;
    invoiceLines.push(invoiceLine);

    const journalItemForCredit = new Object();
    journalItemForCredit.product = item.product;
    journalItemForCredit.account = item.account; //product.account; //"617fd5a56fa70b36e8dde2e3";
    journalItemForCredit.label = item.label;
    journalItemForCredit.debit = 0.0;
    journalItemForCredit.credit = item.subTotal;
    journalItems.push(journalItemForCredit);

    // SGST
    const journalItemForSGST = new Object();
    journalItemForSGST.product = item.product;
    journalItemForSGST.account = sgstAccount; //"617fd5a56fa70b36e8dde2e3";
    journalItemForSGST.label = item.label;
    journalItemForSGST.debit = parseFloat(
      ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
    ).toFixed(2);
    journalItemForSGST.credit = 0.0;
    journalItems.push(journalItemForSGST);

    // CGST
    const journalItemForCGST = new Object();
    journalItemForCGST.product = item.product;
    journalItemForCGST.account = cgstAccount; //"617fd5a56fa70b36e8dde2e3";
    journalItemForCGST.label = item.label;
    journalItemForCGST.debit = parseFloat(
      ((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100
    ).toFixed(2);
    journalItemForCGST.credit = 0.0;
    journalItems.push(journalItemForCGST);

    const journalItemForDebit = new Object();
    journalItemForDebit.product = item.product;
    journalItemForDebit.account = receivableAccount; // Debtors
    journalItemForDebit.label = item.label;
    journalItemForDebit.debit = parseFloat(
      parseFloat(item.subTotal) +
        (((parseInt(item.taxes) / 2) * parseFloat(item.subTotal)) / 100) * 2
    ).toFixed(2);
    journalItemForDebit.credit = 0.0;
    journalItems.push(journalItemForDebit);
  });

  invoiceObject.customer = body.customer;
  invoiceObject.recepientAccount = body.recepientAccount;
  invoiceObject.referenceNumber = body.referenceNumber;
  invoiceObject.invoiceDate = body.invoiceDate;
  if (body.sourceDocument?.length) {
    invoiceObject.isStandalone = false;
    invoiceObject.sourceDocument = body.sourceDocument;
  } else {
    invoiceObject.isStandalone = true;
  }
  invoiceObject.invoiceLines = invoiceLines;
  invoiceObject.journalItems = journalItems;
  invoiceObject.estimation = body.estimation;
  // console.log(invoiceObject);

  // let invoiceDocument;

  return invoiceObject;
};

const calculateProductQty = async (invoiceDocument, next, res) => {
  await Promise.all(
    invoiceDocument?.invoiceLines?.map(async (e) => {
      const productDocument = await Product.findById(e.product[0]._id);
      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(e.product[0]._id, {
          // $inc: { commited: product.quantity, onHand: -product.quantity },
          $inc: {
            // commited: e.quantity,
            onHand: -parseInt(e.quantity),
            available: -parseInt(e.quantity),
            totalSoldQuantity: e.quantity,
          },
        });
      } else {
        // productObject.isAvailable = false;
        return next(
          new CustomAppError(
            res,
            "On hand quantity is less than one in any of your selected product in the bill"
          )
        );
      }
    })
  );
};

exports.updateStandaloneInv = catchAsync(async (req, res, next) => {
  //1. Find inv data to get data before update
  //2. Find inv data after update
  //3. Update items updated qty and journal items

  let receivableAccount;
  let invoiceObject = new Object();
  let invoiceLines = new Array();
  let journalItems = new Array();

  const InvDataBeforeUpdate = await Invoice.findById(req.params.id);
  if (!InvDataBeforeUpdate) {
    return next(new CustomAppError(res, "Issue in getting Invoice data"));
  }
  const InvDataAfterUpdate = await Invoice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!InvDataAfterUpdate) {
    return next(new CustomAppError(res, "Issue in updating Invoice data"));
  }

  await Promise.all(
    (sgstAccount = await Account.find({ title: "SGST PAYABLE" })),
    (cgstAccount = await Account.find({ title: "CGST PAYABLE" })),
    (receivableAccount = await Account.find({ title: "Account receivable" }))
  );

  await Promise.all(
    InvDataAfterUpdate.invoiceLines.map((updateditem) => {
      InvDataBeforeUpdate.invoiceLines.map((previtem) => {
        const journalItemForCredit = new Object();
        journalItemForCredit.product = updateditem.product;
        journalItemForCredit.account = updateditem.account; //product.account; //"617fd5a56fa70b36e8dde2e3";
        journalItemForCredit.label = updateditem.label;
        journalItemForCredit.debit = 0.0;
        journalItemForCredit.credit = updateditem.subTotal;
        journalItems.push(journalItemForCredit);

        // SGST
        const journalItemForSGST = new Object();
        journalItemForSGST.product = updateditem.product;
        journalItemForSGST.account = sgstAccount; //"617fd5a56fa70b36e8dde2e3";
        journalItemForCredit.label = updateditem.label;
        journalItemForSGST.debit = parseFloat(
          ((parseInt(updateditem.taxes) / 2) *
            parseFloat(updateditem.subTotal)) /
            100
        ).toFixed(2);
        journalItemForSGST.credit = 0.0;
        journalItems.push(journalItemForSGST);

        // CGST
        const journalItemForCGST = new Object();
        journalItemForCGST.product = updateditem.product;
        journalItemForCGST.account = cgstAccount; //"617fd5a56fa70b36e8dde2e3";
        journalItemForCredit.label = updateditem.label;
        journalItemForCGST.debit = parseFloat(
          ((parseInt(updateditem.taxes) / 2) *
            parseFloat(updateditem.subTotal)) /
            100
        ).toFixed(2);
        journalItemForCGST.credit = 0.0;
        journalItems.push(journalItemForCGST);

        const journalItemForDebit = new Object();
        journalItemForDebit.product = updateditem.product;
        journalItemForDebit.account = receivableAccount; // Debtors
        journalItemForCredit.label = updateditem.label;
        journalItemForDebit.debit = parseFloat(
          parseFloat(updateditem.subTotal) +
            (((parseInt(updateditem.taxes) / 2) *
              parseFloat(updateditem.subTotal)) /
              100) *
              2
        ).toFixed(2);
        journalItemForDebit.credit = 0.0;
        journalItems.push(journalItemForDebit);
      });
    })
  );

  const UpdateInv = await Invoice.findByIdAndUpdate(
    req.params.id,
    { journalItems: journalItems },
    { new: true }
  );
  if (!UpdateInv) {
    return next(new CustomAppError(res, "Issue in updating Invoice data"));
  }

  await Promise.all(
    UpdateInv?.invoiceLines?.map(async (e) => {
      InvDataBeforeUpdate?.invoiceLines?.map(async (ele) => {
        const productDocument = await Product.findById(e.product[0]._id);
        if (productDocument.onHand > 0) {
          await Product.findByIdAndUpdate(
            e.product[0]._id,
            {
              // $inc: { commited: product.quantity, onHand: -product.quantity },
              $inc: {
                // commited: e.quantity,
                onHand: -(parseInt(e.quantity) - parseInt(ele.quantity)),
                available: -(parseInt(e.quantity) - parseInt(ele.quantity)),
                totalSoldQuantity:
                  parseInt(e.quantity) - parseInt(ele.quantity),
              },
            },
            { new: true }
          );
        } else {
          // productObject.isAvailable = false;
          return next(
            new CustomAppError(
              res,
              "On hand quantity is less than one in any of your selected product in the bill"
            )
          );
        }
      });
    })
  );

  // await Promise.all(
  //   UpdateInv?.invoiceLines?.map(async (e) => {
  //     InvDataBeforeUpdate?.invoiceLines?.map(async (ele) => {
  //       const productDocument = await Product.findById(e.product[0]._id);
  //       if (productDocument.onHand > 0) {
  //         let available =
  //           parseInt(productDocument.onHand) -
  //           parseInt(productDocument.commited);

  //         console.log(available);
  //         // available += parseInt(e.quantity) - parseInt(ele.quantity);
  //         // console.log(available);

  //         await Product.findByIdAndUpdate(e.product[0]._id, {
  //           available: available,
  //         });
  //       } else {
  //         // productObject.isAvailable = false;
  //         return next(
  //           new CustomAppError(
  //             res,
  //             "On hand quantity is less than one in any of your selected product in the bill"
  //           )
  //         );
  //       }
  //     });
  //   })
  // );

  // let invoiceObject = new Object();
  // let invoiceLines = new Array();
  // let journalItems = new Array();

  // req.body.invoiceLines.map((item) => {
  //   const invoiceLine = new Object();
  //   invoiceLine.product = item.product;
  //   invoiceLine.label = req.body.name + ": " + item.label;
  //   invoiceLine.account = item.account; //"617fd5a56fa70b36e8dde2e3";
  //   invoiceLine.quantity = parseInt(item.quantity);
  //   invoiceLine.taxes = item.taxes;
  //   invoiceLine.unitPrice = item.unitPrice;
  //   invoiceLine.subTotal = item.subTotal;
  //   invoiceLines.push(invoiceLine);

  //   const journalItemForCredit = new Object();
  //   journalItemForCredit.product = item.product;
  //   journalItemForCredit.account = "61b839ddd6fe795ec8bf53fb"; //product.account; //"617fd5a56fa70b36e8dde2e3";
  //   journalItemForCredit.label = req.body.name + ": " + item.label;
  //   journalItemForCredit.debit = 0.0;
  //   journalItemForCredit.credit = item.subTotal;
  //   journalItems.push(journalItemForCredit);

  //   const journalItemForDebit = new Object();
  //   journalItemForDebit.product = item.product;
  //   journalItemForDebit.account = "61b839ddd6fe795ec8bf53f6"; // Debtors
  //   journalItemForCredit.label = req.body.name + ": " + item.label;
  //   journalItemForDebit.debit = item.subTotal;
  //   journalItemForDebit.credit = 0.0;
  //   journalItems.push(journalItemForDebit);
  // });

  // invoiceObject.customer = req.body.customer;
  // invoiceObject.recepientAccount = req.body.recepientAccount;
  // invoiceObject.isStandalone = req.body.isStandalone;
  // invoiceObject.invoiceLines = invoiceLines;
  // invoiceObject.journalItems = journalItems;
  // invoiceObject.estimation = req.body.estimation;

  // const invoiceDocument = await Invoice.findByIdAndUpdate(
  //   req.params.id,
  //   // req.body,
  //   invoiceObject,
  //   { new: true }
  // );
  //   .populate([{ path: "customer", select: "id name" }]);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: UpdateInv,
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
      invoiceLine.productName = e.product[0]?.name;
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
