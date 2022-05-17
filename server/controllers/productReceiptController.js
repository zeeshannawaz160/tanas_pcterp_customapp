const ProductReceipt = require("../models/productReceiptModel");
const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const PurchaseOrder = require("../models/purchaseOrderModel");
const { Promise } = require("mongoose");

exports.getAll = factory.getAll(ProductReceipt, [
  { path: "backOrderOf", select: "id name" },
  { path: "sourceDocument", select: "id purchaseOrderId name" },
  { path: "vendor", select: "id name" },
]);
exports.getOne = factory.getOne(ProductReceipt, [
  { path: "backOrderOf", select: "id name" },
  { path: "sourceDocument", select: "id purchaseOrderId name" },
]);
exports.createOne = factory.createOne(ProductReceipt);
exports.updateOne = factory.updateOne(ProductReceipt);
exports.deleteOne = factory.deleteOne(ProductReceipt);

exports.findProductreceiptsByPO = catchAsync(async (req, res, next) => {
  const productReceiptDocument = await ProductReceipt.find()
    .where("sourceDocument")
    .equals(req.params.id)
    .where("status")
    .equals("Done")
    .populate([
      { path: "vendor", select: "id name" },
      { path: "sourceDocument", select: "id name" },
      { path: "backOrderOf", select: "id name" }
    ]);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: productReceiptDocument.length,
    documents: productReceiptDocument,
  });
});

exports.createProductReceipt = catchAsync(async (req, res, next) => {
  // 1. Get the data in req.body and create ProductReceipt document.
  // 2. After creating product receipt document, get the recently created document id and update the
  //      productReceipts

  const productReceiptDocument = await ProductReceipt.create(req.body);
  console.log("Created", productReceiptDocument);
  await PurchaseOrder.findByIdAndUpdate(
    productReceiptDocument.sourceDocument,
    { productReceipt: productReceiptDocument.id },
    { new: true }
  );

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: productReceiptDocument,
  });
});

exports.completeProductReceipt = catchAsync(async (req, res, next) => {
  let totalPurchaseQty = 0;
  let totalReceivedQty = 0;
  let totalBilledQty = 0;

  const productReceiptDocument = await ProductReceipt.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  const purchaseOrder = await PurchaseOrder.findById(
    productReceiptDocument.sourceDocument
  );

  await Promise.all(
    productReceiptDocument.operations.map(async (product) => {
      await Product.findByIdAndUpdate(product.product, {
        $inc: {
          onHand: product.doneQuantity,
          totalPurchasedQuantity: product.doneQuantity,
        },
      });
    }),
    productReceiptDocument.operations.map(async (product) => {
      const objIndex = purchaseOrder.products.findIndex(
        (obj) => obj._id == product.productIdentifier
      );
      purchaseOrder.products[objIndex].received += product.doneQuantity;
    })
  );
  // purchaseOrder.billingStatus = "Waiting Bills";
  if (productReceiptDocument.isFullyReceived) {
    purchaseOrder.isFullyReceived = true;
  }
  const PO = await PurchaseOrder.findByIdAndUpdate(
    productReceiptDocument.sourceDocument,
    purchaseOrder,
    { new: true }
  );

  PO.products.map((e) => {
    totalPurchaseQty += parseInt(e.quantity);
    totalReceivedQty += parseInt(e.received);
    totalBilledQty += parseInt(e.billed);
  });

  console.log("totalPurchaseQty: ", totalPurchaseQty);
  console.log("totalReceivedQty: ", totalReceivedQty);
  console.log("totalBilledQty: ", totalBilledQty);
  if (
    totalPurchaseQty === totalReceivedQty &&
    totalPurchaseQty === totalBilledQty
  ) {
    await PurchaseOrder.findByIdAndUpdate(
      productReceiptDocument.sourceDocument,
      { billingStatus: "Fully Billed" },
      { new: true }
    );
  } else if (totalPurchaseQty === totalReceivedQty) {
    await PurchaseOrder.findByIdAndUpdate(
      productReceiptDocument.sourceDocument,
      { billingStatus: "Fully Received / Partially billed" },
      { new: true }
    );
  } else {
    await PurchaseOrder.findByIdAndUpdate(
      productReceiptDocument.sourceDocument,
      { billingStatus: "Partially Received / Billed" },
      { new: true }
    );
  }

  // console.log("Updated", productReceiptDocument);
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: productReceiptDocument,
  });
});
