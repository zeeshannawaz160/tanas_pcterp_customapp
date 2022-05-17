const DeliveryProduct = require("../models/productDeliveryModel");
const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const SalesOrder = require("../models/salesOrderModel");
const { Promise } = require("mongoose");
const ProductDelivery = require("../models/productDeliveryModel");

exports.getAll = factory.getAll(DeliveryProduct, [
  { path: "sourceDocument", select: "id name" },
  { path: "customer", select: "id name" },
]);
exports.getOne = factory.getOne(DeliveryProduct, [
  { path: "sourceDocument", select: "id name" },
]);
exports.createOne = factory.createOne(DeliveryProduct);
exports.updateOne = factory.updateOne(DeliveryProduct);
exports.deleteOne = factory.deleteOne(DeliveryProduct);

exports.findProductDeliveriesBySO = catchAsync(async (req, res, next) => {
  console.log("SO", req.params.id);
  const productDeliveryDocument = await ProductDelivery.find()
    .where("sourceDocument")
    .equals(req.params.id)
    .where("status")
    .equals("Done")
    .populate([
      { path: "customer", select: "id name" },
      { path: "sourceDocument", select: "id name" },
    ]);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: productDeliveryDocument.length,
    documents: productDeliveryDocument,
  });
});

exports.createDeliveryProduct = catchAsync(async (req, res, next) => {
  const productDeliveryDocument = await DeliveryProduct.create(req.body);
  await SalesOrder.findByIdAndUpdate(
    productDeliveryDocument.sourceDocument,
    { productDelivery: productDeliveryDocument._id },
    { new: true }
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: productDeliveryDocument,
  });
});

exports.createDeliveryProductAfterDelete = catchAsync(
  async (req, res, next) => {
    let productDeliveryArray = new Array();

    // const productDeliveryDocument = await DeliveryProduct.create(req.body);
    const salesOrderDocument = await SalesOrder.findById(req.params.id);
    if (!salesOrderDocument) {
      return next(new AppError("No document found with that ID", 404));
    }

    salesOrderDocument.products.map(async (product) => {
      let productObject = new Object();
      productObject.productIdentifier = product._id;
      productObject.product = product.product;
      productObject.name = product.name;
      productObject.description = product.description;
      productObject.demandQuantity =
        parseInt(product.quantity) - parseInt(product.delivered);
      productObject.doneQuantity = 0;
      productDeliveryArray.push(productObject);
    });
    let productDeliveryObject = new Object();
    productDeliveryObject.sourceDocument = salesOrderDocument._id;
    productDeliveryObject.deliveryAddress = salesOrderDocument.shippingAddress;
    productDeliveryObject.customer = salesOrderDocument.customer;
    productDeliveryObject.scheduledDate = salesOrderDocument.deliveryDate;
    productDeliveryObject.operations = productDeliveryArray;

    const productDeliveryDocument = await ProductDelivery.create(
      productDeliveryObject
    );
    if (!productDeliveryDocument) {
      return next(new AppError("No document found with that ID", 404));
    }

    const updatedSalesOrderDocument = await SalesOrder.findByIdAndUpdate(
      salesOrderDocument._id,
      { productDelivery: productDeliveryDocument._id },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: productDeliveryDocument,
    });
  }
);

exports.completeProductDelivery = catchAsync(async (req, res, next) => {
  let totalSalesQty = 0;
  let totalDeliveredQty = 0;
  let totalInvoicedQty = 0;

  const productDeliveryDocument = await ProductDelivery.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  const salesOrder = await SalesOrder.findById(
    productDeliveryDocument.sourceDocument
  );

  await Promise.all(
    // productDeliveryDocument.operations.map(async (product) => {
    //   await Product.findByIdAndUpdate(product.product, {
    //     $inc: {
    //       onHand: -parseInt(product.doneQuantity),
    //       totalSoldQuantity: product.doneQuantity,
    //     },
    //   });
    // }),
    productDeliveryDocument.operations.map(async (product) => {
      const objIndex = salesOrder.products.findIndex(
        (obj) => obj._id == product.productIdentifier
      );
      salesOrder.products[objIndex].delivered += product.doneQuantity;
    })
  );

  // salesOrder.invoiceStatus = "To Invoice";
  if (productDeliveryDocument.isFullyDelivered) {
    salesOrder.isFullyDelivered = true;
  }
  // console.log("So", salesOrder);
  const SO = await SalesOrder.findByIdAndUpdate(
    productDeliveryDocument.sourceDocument,
    salesOrder,
    { new: true }
  );

  //
  SO.products.map((e) => {
    totalSalesQty += parseInt(e.quantity);
    totalDeliveredQty += parseInt(e.delivered);
    totalInvoicedQty += parseInt(e.invoiced);
  });

  console.log("totalSalesQty: ", totalSalesQty);
  console.log("totalDeliveredQty: ", totalDeliveredQty);
  console.log("totalInvoicedQty: ", totalInvoicedQty);
  if (
    totalSalesQty === totalDeliveredQty &&
    totalSalesQty === totalInvoicedQty
  ) {
    await SalesOrder.findByIdAndUpdate(
      productDeliveryDocument.sourceDocument,
      { invoiceStatus: "Fully Invoiced" },
      { new: true }
    );
  } else if (totalSalesQty === totalDeliveredQty) {
    await SalesOrder.findByIdAndUpdate(
      productDeliveryDocument.sourceDocument,
      { invoiceStatus: "Fully Delivered / Partially Invoiced" },
      { new: true }
    );
  } else {
    await SalesOrder.findByIdAndUpdate(
      productDeliveryDocument.sourceDocument,
      { invoiceStatus: "Partially Delivered / Invoiced" },
      { new: true }
    );
  }
  //

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: productDeliveryDocument,
  });
});

/**
 * Title: Delete delivery product
 * Request: DELETE
 * Routes: api/v1/productDelivery/:id
 *
 * This method will accept the id of deliveryProduct which is going to be deleted(the deliveryProduct need's to be in "Draft"
 * status to delete this delivery product).
 *
 * Below method's(Name: deleteDeliveryProduct) work:-
 * 1. Delete the delivery product document.
 * 2. Find SO document
 * 3. Update SO's "productDelivery" property to null and "isFullyDelivered" to false.
 *
 * Change Log: Rehan has format the code. This code is working fine
 *
 */
exports.deleteDeliveryProduct = catchAsync(async (req, res, next) => {
  console.log("into");
  const doc = await DeliveryProduct.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  const soDoc = await SalesOrder.findById(doc.sourceDocument);
  if (!soDoc) {
    return next(new AppError("No document found with that ID", 404));
  }

  await SalesOrder.findByIdAndUpdate(
    soDoc._id,
    { productDelivery: null, isFullyDelivered: false },
    { new: true }
  );

  res.status(204).json({
    isSuccess: true,
    status: "success",
    document: null,
  });
});
