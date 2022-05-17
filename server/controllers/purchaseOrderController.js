const PurchaseOrder = require("../models/purchaseOrderModel");
const ProductReceipt = require("../models/productReceiptModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const { Promise } = require("mongoose");
const Product = require("../models/productModel");
const Bill = require("../models/billModel");
const diffHistory = require("mongoose-diff-history/diffHistory");

exports.getAll = factory.getAll(PurchaseOrder);
exports.getOne = factory.getOne(PurchaseOrder);
exports.createOne = factory.createOne(PurchaseOrder);
exports.updateOne = factory.updateOne(PurchaseOrder);
exports.deleteOne = factory.deleteOne(PurchaseOrder);

exports.getOneForPdf = factory.getOne(PurchaseOrder, [
  { path: "vendor", select: "id name address" },
]);

/**
 * Title: Purchase Order Document Creation
 * Request: POST
 * Routes: api/v1/purchaseOrder
 *
 * This method will accepts the body data from the client and create purchse order document in mongodb.After creating purchase
 * order, update selected bill with _id of purchase order and "isUsed" field set to "true". After that it will craete the product
 * receipt document, and then update the purchse order with the recently created product receipt _id and set the purchase order's
 * billing status to "Fully Billed". After finish all these things update each product quantity.
 *
 * Change Log
 * 15-05-2022: Biswajit created this method
 * 16-05-2022: Biswajit add update product quantity to this method
 *
 */
exports.createPurchaseOrder = catchAsync(async (req, res, next) => {
  if (!req.body) return next(new AppError("No data found", 404));

  // Step 1: Purchase Order Document Creating.
  const purchaseOrderDocument = await PurchaseOrder.create(req.body);

  if (!purchaseOrderDocument) {
    return next(new AppError("Issue in creating purchase order", 404));
  }

  //Update bill with PO's id
  const updateBill = await Bill.findByIdAndUpdate(
    mongoose.Types.ObjectId(req.body.billId),
    {
      attachedPO: purchaseOrderDocument?._id,
      isUsed: true,
    },
    {
      new: true,
      runValidators: false,
    }
  );
  if (!updateBill) {
    return next(new AppError("Issue in update bill document", 404));
  }

  // Declare variable
  let productReceiptObject = new Array();
  let array = new Array();

  // Step 2: Prepare the Product Receipt Document
  purchaseOrderDocument?.products.map((item) => {
    let productObject = new Object();
    productObject.productIdentifier = item._id;
    productObject.product = item.product;
    productObject.name = item.name;
    productObject.description = item.description;
    productObject.demandQuantity = item.quantity;
    productObject.doneQuantity = item.quantity;
    productReceiptObject.push(productObject);
  });

  let newObject = new Object();
  newObject.sourceDocument = purchaseOrderDocument?._id;
  newObject.status = "Done";
  newObject.isFullyReceived = true;
  newObject.vendor = purchaseOrderDocument?.vendor;
  newObject.referenceNumber = purchaseOrderDocument?.referenceNumber;
  newObject.scheduledDate = purchaseOrderDocument?.receiptDate;
  newObject.operations = productReceiptObject;

  // Step 2: Creating Product Receipt
  const productReceiptDocument = await ProductReceipt.create(newObject);
  if (!productReceiptDocument) {
    return next(
      new AppError("Issue in creating product receipt document", 404)
    );
  }

  // Step 3: Updating Purchase Order
  await Promise.all(
    purchaseOrderDocument.products.map((e) => {
      let obj = new Object();

      obj = e;
      obj.received = e.quantity;
      obj.billed = e.quantity;
      array.push(obj);
    })
  );

  const updatedPurchaseOrderDocument = await PurchaseOrder.findByIdAndUpdate(
    mongoose.Types.ObjectId(purchaseOrderDocument._id),
    {
      productReceipt: productReceiptDocument._id,
      billingStatus: "Fully Billed",
      isFullyReceived: true,
      isFullyBilled: true,
      products: array,
    },
    {
      new: true,
      runValidators: false,
    }
  );

  increaseProductQuantity(updatedPurchaseOrderDocument);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: updatedPurchaseOrderDocument,
  });
});

/**
 * Title: Purchase Order Document Update.
 * Request: PATCH
 * Routes: api/v1/purchaseOrder/:id
 *
 * This methid will accepts the body data from client and _id from request params and update the Purchase Order.
 *
 *
 * Change Log: Rehan has format the code. This code is working fine
 *
 */
exports.updatePurchaseOrder = catchAsync(async (req, res, next) => {
  const purchaseOrderDocument = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      __user: req.user ? { name: req.user.name, _id: req.user._id } : "Unknown",
    }
  );

  if (!purchaseOrderDocument) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Updating Product Receipt
  let productReceiptObject = new Array();
  purchaseOrderDocument.products.map((item) => {
    if (item.quantity !== item.received) {
      let productObject = new Object();
      productObject.productIdentifier = item._id;
      productObject.product = item.product;
      productObject.name = item.name;
      productObject.description = item.description;
      productObject.demandQuantity =
        parseInt(item.quantity) - parseInt(item.received);
      productObject.doneQuantity = 0;
      productReceiptObject.push(productObject);
    }
  });

  let newObject = new Object();
  newObject.sourceDocument = purchaseOrderDocument.id;
  newObject.vendor = purchaseOrderDocument.vendor;
  newObject.referenceNumber = purchaseOrderDocument.referenceNumber;
  newObject.scheduledDate = purchaseOrderDocument.receiptDate;
  newObject.operations = productReceiptObject;

  await ProductReceipt.findByIdAndUpdate(
    purchaseOrderDocument.productReceipt,
    newObject
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: purchaseOrderDocument,
  });
});

/**
 * Title: Delete Purchase Order and their Related Product Receipt
 * Request: DELETE
 * Routes: api/v1/purchaseOrder/:id
 *
 * This method will accepts params from routes and delete the purchase order and related record
 * Condition: After product receipt you cannot delete the purchase order.
 *
 * Change Log:
 * 25-24-2022: Rehan has format the code. The code is working fine.
 */
exports.deletePurchaseOrder = catchAsync(async (req, res, next) => {
  // Step 1: Get the Purchase Order and find the related docuemnt _id
  // Step 2: Delete Related Record First then delete Purchase Order.

  const purchaseOrderId = req.params.id;
  const purchaseOrderDocument = await PurchaseOrder.findById(purchaseOrderId);

  await ProductReceipt.findByIdAndDelete(purchaseOrderDocument.productReceipt);
  await PurchaseOrder.findByIdAndDelete(purchaseOrderId);

  res.status(204).json({
    isSuccess: true,
    status: "success",
    document: null,
  });
});

const increaseProductQuantity = async (data) => {
  await Promise.all(
    data?.products.map(async (product) => {
      // console.log(product);
      await Product.findByIdAndUpdate(product.product[0]._id, {
        $inc: {
          onHand: product.quantity,
          totalPurchasedQuantity: product.quantity,
        },
      });
    })
  );

  await Promise.all(
    data?.products.map(async (product) => {
      // console.log(product);
      const productDocument = await Product.findById(product.product[0]._id);
      // console.log("productDocument", productDocument);
      let availabel = productDocument.onHand - productDocument.commited;
      await Product.findByIdAndUpdate(product.product[0]._id, {
        available: availabel,
      });
    })
  );
};

/**
 * Title: Increase the Product on hand and total purchase quantity.
 * Request: PATCH
 * Routes: api/v1/increaseProductQty/:id  Note: here id is purchase order document _id
 *
 * This method is use to increase the product quantity.
 */
exports.increaseProductQty = catchAsync(async (req, res, next) => {
  const PO = await PurchaseOrder.findById(req.params.id);
  console.log("PO", PO);

  await Promise.all(
    PO.products.map(async (product) => {
      await Product.findByIdAndUpdate(product.product, {
        $inc: {
          onHand: product.quantity,
          totalPurchasedQuantity: product.quantity,
        },
      });
    })
  );

  await Promise.all(
    PO?.products.map(async (product) => {
      console.log(product);
      const productDocument = await Product.findById(product.product);
      let availabel = productDocument.onHand - productDocument.commited;
      await Product.findByIdAndUpdate(product.product, {
        available: availabel,
      });
    })
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: PO,
  });
});

exports.getUnbilledList = catchAsync(async (req, res, next) => {
  const doc = await PurchaseOrder.find({
    $or: [
      { billingStatus: "Waiting Bills" },
      { billingStatus: "Fully Received / Partially billed" },
    ],
  }).select("name id");

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    isSuccess: true,

    status: "success",

    results: doc.length,

    documents: doc,
  });
});

exports.getPurchaseAnalysis = catchAsync(async (req, res, next) => {
  console.log(req.query);

  const name = req.query.name;
  const sTemp = new Date(req.query.start);
  sTemp.setDate(sTemp.getDate() + 1);
  const startTime = sTemp.toISOString();

  const eTemp = new Date(req.query.end);
  eTemp.setDate(eTemp.getDate() + 1);
  const endTime = eTemp.toISOString();

  console.log(name);
  console.log(startTime);
  console.log(endTime);

  let doc;

  if (name === "Orders") {
    doc = await PurchaseOrder.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
        },
      },
      {
        $group: {
          _id: "$date",
          result: { $sum: 1 },
          total: { $sum: "$estimation.total" },
          untaxedAmount: { $sum: "$estimation.untaxedAmount" },
          noOfOrders: { $sum: 1 },
          noOfDays: {
            $avg: {
              $subtract: [new Date(`${endTime}`), new Date(`${startTime}`)],
            },
          },
        },
      },
      {
        $addFields: {
          startDate: new Date(`${startTime}`),
          endDate: new Date(`${endTime}`),
          name: "Orders ",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log("DOC", doc);
  } else if (name === "Total") {
    doc = await PurchaseOrder.aggregate([
      {
        $unwind: "$estimation",
      },
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
        },
      },
      {
        $group: {
          _id: "$date",
          result: { $sum: "$estimation.total" },
          total: { $sum: "$estimation.total" },
          untaxedAmount: { $sum: "$estimation.untaxedAmount" },
          noOfOrders: { $sum: 1 },
          noOfDays: {
            $avg: {
              $subtract: [new Date(`${endTime}`), new Date(`${startTime}`)],
            },
          },
        },
      },
      {
        $addFields: {
          startDate: new Date(`${startTime}`),
          endDate: new Date(`${endTime}`),
          name: "Total ",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  } else if (name === "Quantity Ordered") {
    doc = await PurchaseOrder.aggregate([
      {
        $unwind: "$products",
      },
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
        },
      },
      {
        $group: {
          _id: "$date",
          result: { $sum: "$products.quantity" },
          total: { $sum: "$estimation.total" },
          untaxedAmount: { $sum: "$estimation.untaxedAmount" },
          noOfOrders: { $sum: 1 },
          noOfDays: {
            $avg: {
              $subtract: [new Date(`${endTime}`), new Date(`${startTime}`)],
            },
          },
        },
      },
      {
        $addFields: {
          startDate: new Date(`${startTime}`),
          endDate: new Date(`${endTime}`),
          name: "Quantity Ordered ",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  } else if (name === "Quantity Billed") {
    doc = await PurchaseOrder.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
          billingStatus: {
            $eq: "Fully Billed",
          },
        },
      },
      {
        $group: {
          _id: "$date",
          result: { $sum: 1 },
          total: { $sum: "$estimation.total" },
          untaxedAmount: { $sum: "$estimation.untaxedAmount" },
          noOfOrders: { $sum: 1 },
          noOfDays: {
            $avg: {
              $subtract: [new Date(`${endTime}`), new Date(`${startTime}`)],
            },
          },
        },
      },
      {
        $addFields: {
          startDate: new Date(`${startTime}`),
          endDate: new Date(`${endTime}`),
          name: "Quantity Billed ",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  } else if (name === "Quantity Received") {
    doc = await PurchaseOrder.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
          billingStatus: {
            $eq: "Waiting Bills",
          },
        },
      },
      {
        $group: {
          _id: "$date",
          result: { $sum: 1 },
          total: { $sum: "$estimation.total" },
          untaxedAmount: { $sum: "$estimation.untaxedAmount" },
          noOfOrders: { $sum: 1 },
          noOfDays: {
            $avg: {
              $subtract: [new Date(`${endTime}`), new Date(`${startTime}`)],
            },
          },
        },
      },
      {
        $addFields: {
          startDate: new Date(`${startTime}`),
          endDate: new Date(`${endTime}`),
          name: "Quantity Received",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: doc,
  });
});

exports.getHistories = catchAsync(async (req, res) => {
  const doc = await PurchaseOrder.findById(req.params.id);

  if (!doc) return next(new AppError("Document not found!", 400));

  const historiesDoc = await diffHistory.getDiffs("PurchaseOrder", doc._id, []);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: historiesDoc.length,
    documents: historiesDoc,
  });
});
