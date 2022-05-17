const BOM = require("../models/bomModel");
const Product = require("../models/productModel")
// const { base, book } = require("../models/testModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAll = factory.getAll(BOM, [
  { path: "product", select: "id name" },
  { path: "unit", select: "id name" },
]);
exports.getOne = factory.getOne(BOM);
exports.createOne = factory.createOne(BOM);
exports.updateOne = factory.updateOne(BOM);
exports.deleteOne = factory.deleteOne(BOM);


exports.getList = catchAsync(async (req, res, next) => {
  const document = await BOM.find().select("id name");
  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: document,
  });
});

exports.getProductsOnlyContainBOM = catchAsync(async (req, res, next) => {
  // Get only those products which contain BOM
  let productArray = new Set();

  const productList = await Product.find();
  const BOMList = await BOM.find();



  await Promise.all(
    productList.map((product) => {

      BOMList.map((bom) => {
        if (String(product._id) == String(bom.product[0].id)) {
          productArray.add(product);
        }
      });
    })
  );
  console.log(productArray);
  const array = [...productArray];

  res.status(201).json({
    isSuccess: true,
    status: "success",
    documents: array,
  });
});

//Implement for discriminator testing//
// exports.getAll = factory.getAll(base);
// exports.getOne = factory.getOne(base);
// exports.createOne = factory.createOne(base);
// exports.updateOne = factory.updateOne(base);
// exports.deleteOne = factory.deleteOne(base);

// exports.getAll = factory.getAll(book);
// exports.getOne = factory.getOne(book);
// exports.createOne = factory.createOne(book);
// exports.updateOne = factory.updateOne(book);
// exports.deleteOne = factory.deleteOne(book);


exports.getList = catchAsync(async (req, res, next) => {
  const doc = await BOM.find().select("name id");

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


exports.searchBOMByItem = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  let array = new Array();
  const bomList = await BOM.find();

  await Promise.all(
    bomList.map((e) => {
      console.log(typeof e.product[0].name);
      console.log(typeof req.params.id);

      if (e.product[0].id == req.params.id) {
        array.push(e);
      } else if (e.product[0].name == req.params.id) {
        array.push(e);
      } else if (e.name == req.params.id) {
        array.push(e);
      }
    })
  );
  console.log(array);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    documents: array,
  });
});
