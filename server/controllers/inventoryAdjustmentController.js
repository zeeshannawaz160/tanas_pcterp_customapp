const InventoryAdjustment = require("../models/inventoryAdjustment");
const GeneralLedger = require("../models/generalLedgerModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Item = require("../models/itemModel");
const GLImpact = require("../models/glImpactModel");

exports.getAllInventoryAdjustments = factory.getAll(InventoryAdjustment, [
  { path: "inventoryAdjustmentAccount", select: "id name" },
]);
exports.getInventoryAdjustment = factory.getOne(InventoryAdjustment);
// exports.createInventoryAdjustment = factory.createOne(InventoryAdjustment);
exports.updateInventoryAdjustment = factory.updateOne(InventoryAdjustment);
exports.deleteInventoryAdjustment = factory.deleteOne(InventoryAdjustment);

// exports.createInventoryAdjustment = catchAsync(async (req, res, next) => {
//     // 1. Create inventory adjustment document
//     // 2. Get the Adjustment Account and Item account and create GL Record
//     const inventoryAdjustmentDocument = await InventoryAdjustment.create(req.body);
//     const creditAccount = inventoryAdjustmentDocument.inventoryAdjustmentAccount;
//     inventoryAdjustmentDocument.inventoryAdjustments.map(async (item) => {

//         const amount = (parseInt(item.adjustQuantityBy) * parseInt(item.estimatedUnitCost));
//         const itemDocument = await Item.findById(item.item);
//         const glImpactDebit = new Object();
//         glImpactDebit.account = itemDocument.assetAccount;
//         glImpactDebit.debit = amount
//         glImpactDebit.onModel = "InventoryAdjustment";
//         glImpactDebit.transactionType = inventoryAdjustmentDocument.id;
//         const newGLImpactDebitDocument = await GLImpact.create(glImpactDebit);

//         const glImpactCredit = new Object();
//         glImpactCredit.account = creditAccount;
//         glImpactCredit.credit = amount;
//         glImpactCredit.onModel = "InventoryAdjustment";
//         glImpactCredit.transactionType = inventoryAdjustmentDocument.id;
//         const newGLImpactCreditDocument = await GLImpact.create(glImpactCredit);
//     })

//     res.status(201).json({
//         isSuccess: true,
//         status: 'success',
//         document: inventoryAdjustmentDocument
//     });
// });

exports.createInventoryAdjustment = catchAsync(async (req, res, next) => {
  // 1. Create inventory adjustment document with req.body
  // 2. when inventory adjustment document created siccessfully get the new object.
  // 3. trace the new document of inventory adjustment and create general ledger object and then create general ledger.
  // 4. return step 2.
  console.log("hi");

  let journalItems = new Array();
  let generalLedgers = new Array();
  let InventoryAdjustmentObject = new Object();

  // req.body.products.map(item => {
  //     if (item.quantity >= 0) {
  //         const journalItemForDebit = new Object();
  //         journalItemForDebit.account = req.body.inventoryAdjustmentAccount; //"617fd5a56fa70b36e8dde2e3";
  //         journalItemForDebit.label = ("Inventory Adjustment : " + item.description);
  //         journalItemForDebit.debit = item.subTotal;
  //         journalItemForDebit.credit = 0.00;
  //         journalItems.push(journalItemForDebit);

  //         const journalItemForCredit = new Object();
  //         journalItemForCredit.account = item.account;
  //         journalItemForCredit.debit = 0.00;
  //         journalItemForCredit.credit = item.subTotal;
  //         journalItems.push(journalItemForCredit);
  //     } else {

  //         const journalItemForDebit = new Object();
  //         journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
  //         journalItemForDebit.label = ("Inventory Adjustment : " + item.description);
  //         journalItemForDebit.debit = item.subTotal;
  //         journalItemForDebit.credit = 0.00;
  //         journalItems.push(journalItemForDebit);

  //         const journalItemForCredit = new Object();
  //         journalItemForCredit.account = req.body.inventoryAdjustmentAccount;
  //         journalItemForCredit.debit = 0.00;
  //         journalItemForCredit.credit = item.subTotal;
  //         journalItems.push(journalItemForCredit);

  //     }
  // });

  // InventoryAdjustmentObject.inventoryAdjustmentAccount = req.body.inventoryAdjustmentAccount;
  // InventoryAdjustmentObject.date = req.body.date;
  // InventoryAdjustmentObject.products = req.body.products;
  // InventoryAdjustmentObject.journalItems = journalItems;

  // const inventoryAdjustmentDocumentUpdated = await InventoryAdjustment.create(InventoryAdjustmentObject);

  // inventoryAdjustmentDocumentUpdated.journalItems.map(item => {
  //     const generalLedgerDebit = new Object();
  //     // generalLedgerDebit.date = inventoryAdjustmentDocument.date;
  //     generalLedgerDebit.journalLabel = "Inventory Adjustment";
  //     generalLedgerDebit.journal = "InventoryAdjustment";
  //     generalLedgerDebit.journalEntry = inventoryAdjustmentDocumentUpdated.id;
  //     generalLedgerDebit.account = item.account;
  //     // generalLedgerDebit.entityType = "Customer";
  //     //generalLedgerDebit.entity = invoiceDocument.customer;
  //     generalLedgerDebit.reference = "";
  //     generalLedgerDebit.label = ("Inventory Adjustment: " + item.description);
  //     generalLedgerDebit.debit = item.subTotal;
  //     generalLedgerDebit.credit = 0;
  //     generalLedgerDebit.product = item.product;
  //     generalLedgers.push(generalLedgerDebit);

  //     const generalLedgerCredit = new Object();
  //     // generalLedgerCredit.date = inventoryAdjustmentDocument.date;
  //     generalLedgerCredit.journalLabel = "Inventory Adjustment";
  //     generalLedgerCredit.journal = "InventoryAdjustment";
  //     generalLedgerCredit.journalEntry = inventoryAdjustmentDocumentUpdated.id;
  //     generalLedgerCredit.account = item.account;
  //     // generalLedgerCredit.entityType = "Customer";
  //     //generalLedgerCredit.entity = invoiceDocument.customer;
  //     generalLedgerCredit.reference = "";
  //     // generalLedgerCredit.label = item.label;
  //     generalLedgerCredit.debit = 0;
  //     generalLedgerCredit.credit = item.subTotal;
  //     generalLedgerCredit.product = item.product;
  //     generalLedgers.push(generalLedgerCredit);
  // })

  // const generalLedgerDocument = await GeneralLedger.create(generalLedgers);

  // res.status(201).json({
  //     isSuccess: true,
  //     status: 'success',
  //     document: inventoryAdjustmentDocumentUpdated
  // });
});
