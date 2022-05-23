const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const UOM = require("../models/unitsModel");
const GSTRates = require("../models/gstRatesModel");
const Account = require("../models/accountModel");
const { Promise } = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory");

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product);
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.increaseOnHandQuantity = catchAsync(async (req, res, next) => {
  const document = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: req.body },
    {
      new: true,
    }
  );
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: document,
  });
});

exports.decreaseOnHandQuantity = catchAsync(async (req, res, next) => {
  const document = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: req.body },
    {
      new: true,
    }
  );
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: document,
  });
});

//
exports.getItemByName = catchAsync(async (req, res, next) => {
  const document = await Product.find({ name: req.params.name });
  console.log("document: ", document);
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: document,
  });

  //const document = await Item.find({ name: });
});
//

/**
 * Title: Get Income, Expense and Asset account
 * Request: GET
 * Routes: api/v1/getIEAacc
 *
 * Method description:
 * This method will get Income , Expense and Asset account. Which is set in product form whenever a product will be created
 * these accounts are selected automatically
 *
 * Changes Log:
 * 13-05-2022: Biswajit create the method and get these three accounts
 *
 */
exports.getIncomeExpenseAssetAccount = catchAsync(async (req, res, next) => {
  let incomeAcc, expenseAcc, assetAcc;

  await Promise.all(
    (incomeAcc = await Account.find({ title: "Sales" })),
    (expenseAcc = await Account.find({ title: "COGS" })),
    (assetAcc = await Account.find({ title: "Inventory Asset" }))
  );

  console.log("incomeAcc:", incomeAcc);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: {
      incomeAcc: incomeAcc,
      expenseAcc: expenseAcc,
      assetAcc: assetAcc,
    },
  });

  //const document = await Item.find({ name: });
});

exports.productCreate = catchAsync(async (req, res, next) => {
  console.log("req.body: ", req.body);
  let incomeAccount;
  let expenseAccount;
  let PurchasesAccount;
  let uom;
  let hsn;

  await Promise.all(
    (incomeAccount = await Account.find({ title: "Sales" })),
    (expenseAccount = await Account.find({ title: "Labour charge" })),
    (PurchasesAccount = await Account.find({ title: "Purchases" })),
    (uom = await UOM.find({ name: "PCS" })),
    (hsn = await GSTRates.find({ name: "8802" }))
  );
  console.log("incomeAccount", incomeAccount);
  console.log("expenseAccount", expenseAccount);
  console.log("PurchasesAccount", PurchasesAccount);
  console.log("uom", uom);
  console.log("hsn", hsn);

  let productObj = new Object();
  productObj.name = req.body.name;
  productObj.salesPrice = req.body.salesPrice;
  productObj.description = req.body.description;
  productObj.cost = req.body.cost;
  productObj.uom = uom[0]._id;
  productObj.HSNSACS = hsn[0].id;
  productObj.cgstRate = hsn[0].cgstRate;
  productObj.sgstRate = hsn[0].sgstRate;
  productObj.igstRate = hsn[0].igstRate;
  productObj.cess = hsn[0].cess;
  productObj.incomeAccount = incomeAccount[0]._id;
  productObj.expenseAccount = expenseAccount[0]._id;
  productObj.assetAccount = PurchasesAccount[0]._id;
  // productObj.salesPrice = 100;
  // productObj.cost = 90;
  productObj.onHand = 0;
  productObj.available = 0;
  // productObj.averageCost = 80;

  console.log("productObj: ", productObj);
  const productDocument = await Product.create(productObj);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: productDocument,
  });
});

exports.getProductByBarcode = catchAsync(async (req, res, next) => {
  const document = await Product.findOne({ barcode: req.params.barcode });
  console.log(document);
  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: document,
  });

  //const document = await Item.find({ name: });
});

exports.getHsnByProduct = catchAsync(async (req, res, next) => {
  let array = new Array();

  await Promise.all(
    req.body.products?.map(async (e) => {
      let obj = new Object();

      const document = await Product.findById(e?.product[0]?.id);
      const doc = await GSTRates.findById(document?.HSNSACS);

      obj.items = e.name + "\n" + `(HSN Code: ${doc?.name})`;
      obj.price = e.quantity + " x " + e.unitRate;
      array.push(obj);
    })
  );

  // console.log(array);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    document: array,
  });
});

exports.productList = catchAsync(async (req, res, next) => {
  const document = await Product.find().select(
    "id name kindOfLiquor kindOfLiquorCode brandName category bottleSize salesPrice"
  );
  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: document,
  });

  //const document = await Item.find({ name: });
});

/**
 * Title: Get Income, Expense and Asset account
 * Request: GET
 * Routes: api/v1/product/import
 *
 * Method description:
 * This method will get Income , Expense, Asset account and all units. After that format the data received from body to save into product
 * database.
 *
 * Changes Log:
 * 20-05-2022: Biswajit create the method
 *
 */
exports.importProduct = catchAsync(async (req, res, next) => {
  let assetAcc;
  let imcomeAcc;
  let expenseAcc;
  let units;
  let productArray = new Array();

  await Promise.all(
    (assetAcc = await Account.find({ title: "Inventory Asset" })),
    (imcomeAcc = await Account.find({ title: "Sales" })),
    (expenseAcc = await Account.find({ title: "COGS" })),
    (units = await UOM.find())
  );

  await Promise.all(
    req.body?.map((e) => {
      let productObj = new Object();

      productObj.name = e.PRODUCTNAME;
      productObj.description = e.DESCRIPTION;
      productObj.cost = e.COST;
      productObj.salesPrice = e.SALESPRICE;
      productObj.incomeAccount = imcomeAcc;
      productObj.expenseAccount = expenseAcc;
      productObj.assetAccount = assetAcc;
      const unit = units.filter((ele) => ele.name == e.UNIT);
      productObj.uom = unit;

      productArray.push(productObj);
    })
  );

  console.log("array: ", productArray);

  const docs = await Product.insertMany(productArray, function (error, doc) {
    console.log("error: ", error);
    if (error) {
      return next(new AppError("Products has not been imported", 404));
    }
  });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: docs,
  });
});

exports.getHistories = catchAsync(async (req, res) => {
  const doc = await Product.findById(req.params.id);

  if (!doc) return next(new AppError("Document not found!", 400));

  const historiesDoc = await diffHistory.getDiffs("Product", doc._id, []);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: historiesDoc.length,
    documents: historiesDoc,
  });
});
