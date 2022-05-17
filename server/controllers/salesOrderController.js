const mongoose = require("mongoose");
const SalesOrder = require("../models/salesOrderModel");
const Invoice = require("../models/invoiceModel");
const ProductDelivery = require("../models/productDeliveryModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Promise } = require("mongoose");
const Product = require("../models/productModel");
const CustomAppError = require("../utils/customAppError");

exports.getAll = factory.getAll(SalesOrder, [
  { path: "customer", select: "id name" },
]);
exports.getOne = factory.getOne(SalesOrder, [
  { path: "productDelivered.productDelivery" },
  { path: "invoiced.invoice" },
]);
exports.createOne = factory.createOne(SalesOrder);
exports.updateOne = factory.updateOne(SalesOrder);
exports.deleteOne = factory.deleteOne(SalesOrder);

exports.deleteSalesOrder = catchAsync(async (req, res, next) => {
  const doc = await SalesOrder.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  console.log(doc);
  await Promise.all(
    doc?.products?.map(async (e) => {
      const productDocument = await Product.findById(e.product);
      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(e.product, {
          $inc: { commited: -e.quantity },
        });
      } else {
        productObject.isAvailable = false;
      }
    })
  );

  await Promise.all(
    doc?.products?.map(async (e) => {
      const productDocument = await Product.findById(e.product);
      const availabel = productDocument.onHand - productDocument.commited;
      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(e.product, {
          available: availabel,
        });
      } else {
        productObject.isAvailable = false;
      }
    })
  );

  res.status(204).json({
    isSuccess: true,
    status: "success",
    document: null,
  });
});

exports.updateSalesOrder = catchAsync(async (req, res, next) => {
  const prevSO = await SalesOrder.findById(req.params.id);
  const salesOrderDocument = await SalesOrder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!salesOrderDocument) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Updating Product Delivary and Product
  let productDeliveryObject = new Array();

  await Promise.all(
    salesOrderDocument.products.map(async (item) => {
      prevSO.products.map(async (e) => {
        if (item.name === e.name) {
          console.log("for ", item.name);
          console.log("prev:", e.quantity);
          console.log("new:", item.quantity);

          let qtyDifference = item.quantity - e.quantity;
          console.log(qtyDifference);

          const productDocument = await Product.findById(item.product);
          if (productDocument.onHand > 0) {
            await Product.findByIdAndUpdate(item.product, {
              // $inc: { commited: product.quantity, onHand: -product.quantity },
              $inc: { commited: qtyDifference },
            });
          } else {
            productObject.isAvailable = false;
          }
        } else {
          console.log("do something");
        }
      });
    }),

    salesOrderDocument.products.map(async (item) => {
      if (item.quantity !== item.delivered) {
        let productObject = new Object();

        productObject.productIdentifier = item._id;
        productObject.product = item.product;
        productObject.name = item.name;
        productObject.description = item.description;
        productObject.demandQuantity =
          parseInt(item.quantity) - parseInt(item.delivered);
        productObject.doneQuantity = 0;
        productDeliveryObject.push(productObject);
      }
    })
  );

  let newObject = new Object();
  newObject.sourceDocument = salesOrderDocument.id;
  newObject.vendor = salesOrderDocument.vendor;
  newObject.scheduledDate = salesOrderDocument.receiptDate;
  newObject.operations = productDeliveryObject;

  await ProductDelivery.findByIdAndUpdate(
    salesOrderDocument.productDelivery,
    newObject
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: salesOrderDocument,
  });
});

exports.createSalesOrder = catchAsync(async (req, res, next) => {
  // 1. Create Sales Order
  // 2. Minus Available Quantity and Add Commited Quantity.
  // 3. Create Product Delivery. If quantity is available then productAvailable is true, else false.

  const salesOrderDocument = await SalesOrder.create(req.body);

  let productDeliveryObject = new Array();

  await Promise.all(
    salesOrderDocument.products.map(async (product) => {
      let productObject = new Object();

      const productDocument = await Product.findById(product.product);
      const commited = productDocument.commited + product.quantity;
      console.log("productDocument.commited:", productDocument.commited);
      console.log("product qty", product.quantity);
      console.log("commited:", commited);

      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(product.product, {
          // $inc: { commited: product.quantity, onHand: -product.quantity },
          commited: commited,
        });
      } else {
        productObject.isAvailable = false;
      }

      productObject.productIdentifier = product._id;
      productObject.product = product.product;
      productObject.name = product.name;
      productObject.description = product.description;
      productObject.demandQuantity = product.quantity;
      productObject.doneQuantity = 0;
      productDeliveryObject.push(productObject);
    })
  );

  await Promise.all(
    salesOrderDocument.products.map(async (product) => {
      const productDocument = await Product.findById(product.product);
      const availabel = productDocument.onHand - productDocument.commited;
      console.log("productDocument.onHand:", productDocument.onHand);
      console.log("productDocument.commited:", productDocument.commited);
      console.log("availabel:", availabel);

      if (productDocument.onHand > 0) {
        await Product.findByIdAndUpdate(product.product, {
          // $inc: { commited: product.quantity, onHand: -product.quantity },
          available: availabel,
        });
      } else {
        //productObject.isAvailable = false;
      }
    })
  );

  // salesOrderDocument.products.map(product => {
  //     let productObject = new Object();
  //     productObject.productIdentifier = product._id;
  //     productObject.product = product.product;
  //     productObject.description = product.description;
  //     productObject.demandQuantity = product.quantity;
  //     productObject.doneQuantity = 0;
  //     productDeliveryObject.push(productObject);
  // });

  let newObject = new Object();
  newObject.sourceDocument = salesOrderDocument.id;
  newObject.deliveryAddress = salesOrderDocument.shippingAddress;
  newObject.customer = salesOrderDocument.customer;
  newObject.scheduledDate = salesOrderDocument.deliveryDate;
  newObject.operations = productDeliveryObject;

  const productDeliveryDocument = await ProductDelivery.create(newObject);

  const updatedSalesOrderDocument = await SalesOrder.findByIdAndUpdate(
    mongoose.Types.ObjectId(salesOrderDocument.id),
    { productDelivery: productDeliveryDocument.id },
    {
      new: true,
      runValidators: false,
    }
  );

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: updatedSalesOrderDocument,
  });
});

exports.decreseProductOnhandAndAvailabel = catchAsync(
  async (req, res, next) => {
    //1. Find So
    //2. Update onHand qty = onhand Qty - product qty
    //3. Update commited = commited - product qty
    //4. Update totalSoldQuantity = totalSoldQuantity + product qty
    //5. Update availabel = onhand - commited

    // const SO = await SalesOrder.findById(req.params.id);
    const INV = await Invoice.findById(req.params.id);
    console.log(INV);

    await Promise.all(
      INV?.invoiceLines.map(async (product) => {
        // console.log(product);
        await Product.findByIdAndUpdate(product.product, {
          $inc: {
            onHand: -parseInt(product.quantity),
            commited: -parseInt(product.quantity),
            totalSoldQuantity: product.quantity,
          },
        });
      })
    );

    await Promise.all(
      INV?.invoiceLines.map(async (product) => {
        const productDocument = await Product.findById(product.product);
        const availabel = productDocument.onHand - productDocument.commited;

        await Product.findByIdAndUpdate(product.product, {
          available: availabel,
        });
      })
    );

    res.status(201).json({
      isSuccess: true,
      status: "success",
      document: INV,
    });
  }
);

exports.getUnInvoicedList = catchAsync(async (req, res, next) => {
  const doc = await SalesOrder.find({
    invoiceStatus: "Fully Delivered / Partially Invoiced",
  }).select("name id");

  // console.log("SO: ", doc);
  if (!doc) {
    return next(new CustomAppError(res, "No document found with that ID"));
  }

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: doc.length,
    documents: doc,
  });
});

exports.getSalesAnalysis = catchAsync(async (req, res, next) => {
  console.log(req.query);

  const name = req.query.name;
  const sTemp = new Date(req.query.start);
  sTemp.setDate(sTemp.getDate() + 1);
  const startTime = sTemp.toISOString();

  const eTemp = new Date(req.query.end);
  eTemp.setDate(eTemp.getDate() + 1);
  const endTime = eTemp.toISOString();
  // const startTime = req.query.start;
  // const endTime = req.query.end;

  // const newEndTime = new Date(`${endTime}`);
  // newEndTime.setDate(newEndTime.getDate() + 1);
  // const endTimeIncremented = newEndTime.toLocaleDateString();

  console.log(name);
  console.log(startTime);
  console.log(endTime);

  let doc;

  if (name === "Orders") {
    doc = await SalesOrder.aggregate([
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
  } else if (name === "Total") {
    doc = await SalesOrder.aggregate([
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
    doc = await SalesOrder.aggregate([
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
  } else if (name === "Quantity Invoiced") {
    doc = await SalesOrder.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
          invoiceStatus: {
            $eq: "Fully Invoiced",
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
  } else if (name === "Quantity Delivered") {
    doc = await SalesOrder.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${startTime}`),
            $lte: new Date(`${endTime}`),
          },
          invoiceStatus: {
            $eq: "To Invoice",
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
