const InventoryAdjustment = require("./inventoryAdjustmentModel");
const Product = require("../../models/productModel");
const GeneralLedger = require("../../models/generalLedgerModel");
const factory = require("../../controllers/handlerFactory");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.getAllInventoryAdjustments = factory.getAll(InventoryAdjustment, [
  { path: "inventoryAdjustmentAccount", select: "id name" },
]);
exports.getInventoryAdjustment = factory.getOne(InventoryAdjustment);
// exports.createInventoryAdjustment = factory.createOne(InventoryAdjustment);
exports.updateInventoryAdjustment = factory.updateOne(InventoryAdjustment);
exports.deleteInventoryAdjustment = factory.deleteOne(InventoryAdjustment);

/**
 * Title: Inventory Adjustment create
 * Request: POST
 * Routes: api/v1/inventoryAdjustment
 *
 * Method description:
 * This method will accepts the body data from the client and create Inventory Adjustment document in mongodb
 * After creating Inventory Adjustment, update each products onHand and available quantity selected in Inventory Adjustment
 *
 * Changes Log:
 *           : Rehan updated products onHand quantity
 * 12-05-2022: Biswajit updated products available quantity
 *
 */
exports.createInventoryAdjustment = catchAsync(async (req, res, next) => {
  try {
    // 1. Create inventory adjustment document with req.body
    // 2. when inventory adjustment document created siccessfully get the new object.
    // 3. trace the new document of inventory adjustment and create general ledger object and then create general ledger.
    // 4. return step 2.

    let journalItems = new Array();
    let generalLedgers = new Array();
    let InventoryAdjustmentObject = new Object();

    req.body.products.map((item) => {
      console.log("ITEM", item);
      if (item.quantity >= 0) {
        const journalItemForDebit = new Object();
        journalItemForDebit.account = req.body.inventoryAdjustmentAccount; //"617fd5a56fa70b36e8dde2e3";
        journalItemForDebit.label =
          "Inventory Adjustment : " + item.description;
        journalItemForDebit.debit = item.subTotal;
        journalItemForDebit.credit = 0.0;
        journalItems.push(journalItemForDebit);

        const journalItemForCredit = new Object();
        journalItemForCredit.account = item.account;
        journalItemForCredit.debit = 0.0;
        journalItemForCredit.credit = item.subTotal;
        journalItems.push(journalItemForCredit);
      } else {
        const journalItemForDebit = new Object();
        journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
        journalItemForDebit.label =
          "Inventory Adjustment : " + item.description;
        journalItemForDebit.debit = item.subTotal;
        journalItemForDebit.credit = 0.0;
        journalItems.push(journalItemForDebit);

        const journalItemForCredit = new Object();
        journalItemForCredit.account = req.body.inventoryAdjustmentAccount;
        journalItemForCredit.debit = 0.0;
        journalItemForCredit.credit = item.subTotal;
        journalItems.push(journalItemForCredit);
      }
    });

    InventoryAdjustmentObject.inventoryAdjustmentAccount =
      req.body.inventoryAdjustmentAccount;
    InventoryAdjustmentObject.date = req.body.date;
    InventoryAdjustmentObject.total = req.body.total;
    InventoryAdjustmentObject.products = req.body.products;
    InventoryAdjustmentObject.journalItems = journalItems;

    console.log("InventoryAdjustmentObject", InventoryAdjustmentObject);
    const inventoryAdjustmentDocumentUpdated = await InventoryAdjustment.create(
      InventoryAdjustmentObject
    );
    if (!inventoryAdjustmentDocumentUpdated) {
      return next(new AppError("Issue in creating Inventory Adjustment", 404));
    }

    /// Rehan Changes
    await Promise.all(
      inventoryAdjustmentDocumentUpdated.products.map(async (product) => {
        await Product.findByIdAndUpdate(
          product.product,
          {
            $inc: {
              onHand: product.quantity,
            },
          },
          { new: true }
        );
      })
    );

    //Biswajit Changes
    await Promise.all(
      inventoryAdjustmentDocumentUpdated.products.map(async (product) => {
        const productDoc = await Product.findById(product.product);
        let available =
          parseInt(productDoc.onHand) - parseInt(productDoc.commited);

        await Product.findByIdAndUpdate(
          product.product,
          {
            available: available,
          },
          { new: true }
        );
      })
    );

    inventoryAdjustmentDocumentUpdated?.journalItems.map((item) => {
      const generalLedgerDebit = new Object();
      // generalLedgerDebit.date = inventoryAdjustmentDocument.date;
      generalLedgerDebit.journalLabel = "Inventory Adjustment";
      generalLedgerDebit.journal = "InventoryAdjustment";
      generalLedgerDebit.journalEntry = inventoryAdjustmentDocumentUpdated?._id;
      generalLedgerDebit.account = item.account[0].id;
      // generalLedgerDebit.entityType = "Customer";
      //generalLedgerDebit.entity = invoiceDocument.customer;
      generalLedgerDebit.reference = "";
      generalLedgerDebit.label = "Inventory Adjustment: " + item.description;
      generalLedgerDebit.debit = item.debit;
      generalLedgerDebit.credit = 0;
      //generalLedgerDebit.product = item.product[0].id;
      generalLedgers.push(generalLedgerDebit);

      const generalLedgerCredit = new Object();
      // generalLedgerCredit.date = inventoryAdjustmentDocument.date;
      generalLedgerCredit.journalLabel = "Inventory Adjustment";
      generalLedgerCredit.journal = "InventoryAdjustment";
      generalLedgerCredit.journalEntry =
        inventoryAdjustmentDocumentUpdated?._id;
      generalLedgerCredit.account = item.account[0].id;
      // generalLedgerCredit.entityType = "Customer";
      //generalLedgerCredit.entity = invoiceDocument.customer;
      generalLedgerCredit.reference = "";
      // generalLedgerCredit.label = item.label;
      generalLedgerCredit.debit = 0;
      generalLedgerCredit.credit = item.credit;
      //generalLedgerCredit.product = item.product[0].id;
      generalLedgers.push(generalLedgerCredit);
    });

    console.log("generalLedgers", generalLedgers);
    const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
    if (!generalLedgerDocument) {
      return next(new AppError("Issue in creating general Ledgers", 404));
    }

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: inventoryAdjustmentDocumentUpdated,
    });
  } catch (e) {
    console.log(e);
  }
});

// exports.updateInventoryAdjustment = catchAsync(async (req, res, next) => {
//     //1. update with new data
//     //2. create journal items and GL for increased qty

//     try {
//         console.log(req.body)
//         const inventoryAdjustmentDoc = await InventoryAdjustment.findById(req.params.id);
//         console.log(inventoryAdjustmentDoc)

//         const newDocument = req.body;
//         const oldDocument = inventoryAdjustmentDoc;

//         oldDocument.products.map((item) => {
//             console.log("ITEM", item)
//             if (item.quantity >= 0) {
//                 const journalItemForDebit = new Object();
//                 journalItemForDebit.account = req.body.inventoryAdjustmentAccount; //"617fd5a56fa70b36e8dde2e3";
//                 journalItemForDebit.label = "Inventory Adjustment : " + item.description;
//                 journalItemForDebit.debit = item.subTotal;
//                 journalItemForDebit.credit = 0.0;
//                 journalItems.push(journalItemForDebit);

//                 const journalItemForCredit = new Object();
//                 journalItemForCredit.account = item.account;
//                 journalItemForCredit.debit = 0.0;
//                 journalItemForCredit.credit = item.subTotal;
//                 journalItems.push(journalItemForCredit);
//             } else {
//                 const journalItemForDebit = new Object();
//                 journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//                 journalItemForDebit.label = "Inventory Adjustment : " + item.description;
//                 journalItemForDebit.debit = item.subTotal;
//                 journalItemForDebit.credit = 0.0;
//                 journalItems.push(journalItemForDebit);

//                 const journalItemForCredit = new Object();
//                 journalItemForCredit.account = req.body.inventoryAdjustmentAccount;
//                 journalItemForCredit.debit = 0.0;
//                 journalItemForCredit.credit = item.subTotal;
//                 journalItems.push(journalItemForCredit);
//             }
//         });

//     } catch (err) {
//         console.log(err);
//     }

//     // console.log(req.body.previousData.products);
//     // console.log(req.body.newData.products);
//     // const inventoryAdj = await InventoryAdjustment.findById(
//     //     mongoose.Types.ObjectId(req.body.newData._id)
//     // );

//     // let journalItems = new Array();
//     // let generalLedgers = new Array();
//     // let InventoryAdjustmentObject = new Object();

//     // journalItems = inventoryAdj.journalItems;
//     // console.log("journalItems: ", journalItems);

//     // req.body.newData.products.map((item) => {
//     //     req.body.previousData.products.map((previousitem) => {
//     //         if (item.product == previousitem.product) {
//     //             if (item.quantity >= 0) {
//     //                 const journalItemForDebit = new Object();
//     //                 journalItemForDebit.account = item.account; //"617fd5a56fa70b36e8dde2e3";
//     //                 journalItemForDebit.product = item.product;
//     //                 journalItemForDebit.label =
//     //                     "Inventory Adjustment : " + item.description;
//     //                 journalItemForDebit.debit = parseFloat(
//     //                     (parseInt(item.quantity) - parseInt(previousitem.quantity)) *
//     //                     item.unitPrice
//     //                 ).toFixed(2);
//     //                 journalItemForDebit.credit = 0.0;
//     //                 journalItems.push(journalItemForDebit);

//     //                 const journalItemForCredit = new Object();
//     //                 journalItemForCredit.account = req.body.inventoryAdjustmentAccount;
//     //                 journalItemForCredit.product = item.product;
//     //                 journalItemForCredit.debit = 0.0;
//     //                 journalItemForCredit.credit = parseFloat(
//     //                     (parseInt(item.quantity) - parseInt(previousitem.quantity)) *
//     //                     item.unitPrice
//     //                 ).toFixed(2);
//     //                 journalItems.push(journalItemForCredit);
//     //             } else {
//     //                 const journalItemForDebit = new Object();
//     //                 journalItemForDebit.account = req.body.inventoryAdjustmentAccount; //"617fd5a56fa70b36e8dde2e3";
//     //                 journalItemForDebit.product = item.product;
//     //                 journalItemForDebit.label =
//     //                     "Inventory Adjustment : " + item.description;
//     //                 journalItemForDebit.debit = parseFloat(
//     //                     (parseInt(item.quantity) - parseInt(previousitem.quantity)) *
//     //                     item.unitPrice
//     //                 ).toFixed(2);
//     //                 journalItemForDebit.credit = 0.0;
//     //                 journalItems.push(journalItemForDebit);

//     //                 const journalItemForCredit = new Object();
//     //                 journalItemForCredit.account = item.account;
//     //                 journalItemForCredit.product = item.product;
//     //                 journalItemForCredit.debit = 0.0;
//     //                 journalItemForCredit.credit = parseFloat(
//     //                     (parseInt(item.quantity) - parseInt(previousitem.quantity)) *
//     //                     item.unitPrice
//     //                 ).toFixed(2);
//     //                 journalItems.push(journalItemForCredit);
//     //             }
//     //         }
//     //     });
//     // });

//     // // InventoryAdjustmentObject.inventoryAdjustmentAccount =
//     // //   req.body.inventoryAdjustmentAccount;
//     // // InventoryAdjustmentObject.date = req.body.date;
//     // // InventoryAdjustmentObject.products = req.body.products;
//     // // InventoryAdjustmentObject.journalItems = journalItems;

//     // const inventoryAdjustmentDocumentUpdated =
//     //     await InventoryAdjustment.findByIdAndUpdate(
//     //         req.body.newData._id,
//     //         {
//     //             products: req.body.newData.products,
//     //             journalItems: journalItems,
//     //         },
//     //         { new: true }
//     //     );
//     // if (!inventoryAdjustmentDocumentUpdated) {
//     //     return next(new AppError("Issue in creating Inventory Adjustment", 404));
//     // }

//     // inventoryAdjustmentDocumentUpdated?.journalItems.map((item) => {
//     //     const generalLedgerDebit = new Object();
//     //     // generalLedgerDebit.date = inventoryAdjustmentDocument.date;
//     //     generalLedgerDebit.journalLabel = "Inventory Adjustment";
//     //     generalLedgerDebit.journal = "InventoryAdjustment";
//     //     generalLedgerDebit.journalEntry = inventoryAdjustmentDocumentUpdated?._id;
//     //     generalLedgerDebit.account = item.account;
//     //     // generalLedgerDebit.entityType = "Customer";
//     //     //generalLedgerDebit.entity = invoiceDocument.customer;
//     //     generalLedgerDebit.reference = "";
//     //     generalLedgerDebit.label = "Inventory Adjustment: " + item.description;
//     //     generalLedgerDebit.debit = item.debit;
//     //     generalLedgerDebit.credit = 0;
//     //     generalLedgerDebit.product = item.product;
//     //     generalLedgers.push(generalLedgerDebit);

//     //     const generalLedgerCredit = new Object();
//     //     // generalLedgerCredit.date = inventoryAdjustmentDocument.date;
//     //     generalLedgerCredit.journalLabel = "Inventory Adjustment";
//     //     generalLedgerCredit.journal = "InventoryAdjustment";
//     //     generalLedgerCredit.journalEntry = inventoryAdjustmentDocumentUpdated?._id;
//     //     generalLedgerCredit.account = item.account;
//     //     // generalLedgerCredit.entityType = "Customer";
//     //     //generalLedgerCredit.entity = invoiceDocument.customer;
//     //     generalLedgerCredit.reference = "";
//     //     // generalLedgerCredit.label = item.label;
//     //     generalLedgerCredit.debit = 0;
//     //     generalLedgerCredit.credit = item.credit;
//     //     generalLedgerCredit.product = item.product;
//     //     generalLedgers.push(generalLedgerCredit);
//     // });

//     // const generalLedgerDocument = await GeneralLedger.create(generalLedgers);
//     // if (!generalLedgerDocument) {
//     //     return next(new AppError("Issue in creating general Ledgers", 404));
//     // }

//     // res.status(200).json({
//     //     isSuccess: true,
//     //     status: "success",
//     //     document: inventoryAdjustmentDocumentUpdated,
//     // });
// });
