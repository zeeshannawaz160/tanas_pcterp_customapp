const CashSale = require("../models/cashSaleModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const Product = require("../models/productModel");
const Account = require("../models/accountModel");
const GeneralLedger = require("../models/generalLedgerModel");
const { Promise } = require("mongoose");

exports.getAll = factory.getAll(CashSale, [
  { path: "salesRep", select: "id name" },
  { path: "customer", select: "id name" },
]);
exports.getOne = factory.getOne(CashSale, [
  { path: "salesRep", select: "id name" },
  { path: "customer", select: "id name" },
]);
// exports.createOne = factory.createOne(CashSale);
exports.updateOne = factory.updateOne(CashSale);
exports.deleteOne = factory.deleteOne(CashSale);

exports.getProductReport = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const brandName = req.query.brandName;
  const kindOfLiquor = req.query.kindOfLiquor;

  const doc = await CashSale.aggregate([
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.kindOfLiquor": { $eq: `${kindOfLiquor}` },
        "products.brandName": { $eq: `${brandName}` },
      },
    },
    {
      $group: {
        _id: "$date",
        count_1000_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 1000] },
              "$products.quantity",
              0,
            ],
          },
        },
        count_750_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 750] },
              "$products.quantity",
              0,
            ],
          },
        },
        count_500_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 500] },
              "$products.quantity",
              0,
            ],
          },
        },
        count_375_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 375] },
              "$products.quantity",
              0,
            ],
          },
        },
        count_180_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 180] },
              "$products.quantity",
              0,
            ],
          },
        },
        count_90_ml: {
          $sum: {
            $cond: [
              { $eq: ["$products.bottleSize", 90] },
              "$products.quantity",
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: doc,
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const cashSaleDocument = await CashSale.create(req.body);

  // const bank = await Account.find({ title: "Bank" });

  let inventoryAsset;
  let cogs;
  let sales;
  let bank;

  // Find accounts needed for this method
  await Promise.all(
    (inventoryAsset = await Account.find({ title: "Inventory Asset" })),
    (cogs = await Account.find({ title: "COGS" })),
    (sales = await Account.find({ title: "Sales" })),
    (bank = await Account.find({ title: "Bank" }))
  );

  let generalLedgers = [];
  let i = 0;
  await Promise.all(
    cashSaleDocument?.products.map(async (product) => {
      const productDocument = await Product.findById(product.product[0]?.id);
      // console.log("HI====>", productDocument)

      const glInventoryAsset = new Object();
      glInventoryAsset.product = product.product[0]?.id;
      glInventoryAsset.account = inventoryAsset[0]?._id;
      glInventoryAsset.journalLabel = "Cash Sale";
      glInventoryAsset.journal = "CashSale";
      glInventoryAsset.journalEntry = cashSaleDocument?._id;
      glInventoryAsset.entityType = "CashSale";
      glInventoryAsset.entity = cashSaleDocument?._id;
      glInventoryAsset.reference = "CS" + cashSaleDocument?.cashSaleId;
      glInventoryAsset.label = product?.name;
      glInventoryAsset.debit = 0;
      glInventoryAsset.credit = productDocument.averageCost
        ? productDocument.averageCost * product.quantity
        : 0;
      generalLedgers.push(glInventoryAsset);

      const glCogs = new Object();
      glCogs.product = product.product[0]?.id;
      glCogs.account = cogs[0]?._id;
      glCogs.journalLabel = "Cash Sale";
      glCogs.journal = "CashSale";
      glCogs.journalEntry = cashSaleDocument?._id;
      glCogs.entityType = "CashSale";
      glCogs.entity = cashSaleDocument?._id;
      glCogs.reference = "CS" + cashSaleDocument?.cashSaleId;
      glCogs.label = product?.name;
      glCogs.debit = productDocument.averageCost
        ? productDocument.averageCost * product.quantity
        : 0;
      glCogs.credit = 0;
      generalLedgers.push(glCogs);

      const glSales = new Object();
      glSales.product = product.product[0]?.id;
      glSales.account = sales[0]?._id;
      glSales.journalLabel = "Cash Sale";
      glSales.journal = "CashSale";
      glSales.journalEntry = cashSaleDocument?._id;
      glSales.entityType = "CashSale";
      glSales.entity = cashSaleDocument?._id;
      glSales.reference = "CS" + cashSaleDocument?.cashSaleId;
      glSales.label = product?.name;
      glSales.debit = 0;
      glSales.credit = product?.subTotal;
      generalLedgers.push(glSales);

      const glBank = new Object();
      glBank.product = product.product[0]?.id;
      glBank.account = bank[0]?._id;
      glBank.journalLabel = "Cash Sale";
      glBank.journal = "CashSale";
      glBank.journalEntry = cashSaleDocument?._id;
      glBank.entityType = "CashSale";
      glBank.entity = cashSaleDocument?._id;
      glBank.reference = "CS" + cashSaleDocument?.cashSaleId;
      glBank.label = product?.name;
      glBank.debit = product?.subTotal;
      glBank.credit = 0;
      generalLedgers.push(glBank);
    })
  );

  const generalLedgerDocument = await GeneralLedger.create(generalLedgers);

  // console.log("GL ==========>", generalLedgers)

  // console.log(generalLedgerDocument);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: cashSaleDocument,
  });
});

exports.getProductsSalesReport = catchAsync(async (req, res, next) => {
  const type = req.query.type;
  let doc;
  if (type === "employee") {
    doc = await CashSale.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "employees",
          localField: "salesRep",
          foreignField: "_id",
          as: "salesRepDetails",
        },
      },
      {
        $group: {
          // _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          _id: {
            salesRep: "$salesRep",
            productName: "$products.name",
            salesRepDetails: "$salesRepDetails",
          },
          // productDescription: { $sum: '$products.description' },
          totalSoldQuantity: { $sum: "$products.quantity" },
          // salesByEmployee: {
          //     $push: {
          //         salesRep: '$salesRep',
          //         productName: '$products.name',
          //         productDescription: '$products.description',
          //         totalSoldQuantity: { $sum: '$products.quantity' },
          //     }
          // },
        },
      },
      // {
      //     $group: {
      //         _id: { salesRep: '$salesRep', totalSoldQuantity: { $sum: '$products.quantity' } },
      //     }
      // },
      // {
      //     $lookup: {
      //         from: "employees",
      //         localField: "salesRep",
      //         foreignField: "id",
      //         as: "salesRepDetails"
      //     }
      // },
      // {
      //     $unwind: '$salesRepDetails'
      // },
      // {
      //     $match: {
      //         'salesRepDetails._id': { $eq: '$salesRep' }
      //     }
      // },
      {
        $sort: { totalSoldQuantity: -1 },
      },
    ]);
  } else if (type === "time") {
    doc = await CashSale.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            productName: "$products.name",
          },
          totalSoldQuantity: { $sum: "$products.quantity" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
  } else if (type === "customer") {
    doc = await CashSale.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $group: {
          _id: {
            customer: "$customer",
            productName: "$products.name",
            customerDetails: "$customerDetails",
          },
          totalSoldQuantity: { $sum: "$products.quantity" },
        },
      },
      // {
      //     $lookup: {
      //         from: "customers",
      //         let: { id: "$customer" },
      //         pipeline: [{ $match: { $expr: { $eq: ["_id", "$id"] } } }],
      //         as: "z"
      //     }
      // },
      // {
      //     $lookup: {
      //         from: "customers",
      //         let: { id: "$customer" },
      //         pipeline: [
      //             { $project: { _id: 1, bid: { "$toObjectId": "$$id" } } },
      //             { $match: { $expr: { $eq: ["$_id", "$bid"] } } }
      //         ],
      //         as: "b"
      //     }
      // },
      // {
      //     $project: {
      //         _id: 1,
      //         customer: { "$toObjectId": "$customer" }
      //     }
      // },

      {
        $sort: { totalSoldQuantity: -1 },
      },
    ]);
  }

  res.status(201).json({
    isSuccess: true,
    status: "success",
    document: doc,
  });
});

exports.getOrdersGeneralLedger = catchAsync(async (req, res, next) => {
  const doc = await GeneralLedger.find()
    .where("entity")
    .equals(req.params.id)
    .populate([
      { path: "product", select: "id name" },
      { path: "entity", select: "id name" },
      { path: "account", select: "id name" },
      { path: "journalEntry", select: "id name" },
    ]);

  console.log("GLCS=====>", doc);

  res.status(201).json({
    isSuccess: true,
    status: "success",
    documents: doc,
  });
});

//Old code

// const CashSale = require("../models/cashSaleModel");
// const factory = require("./handlerFactory");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
// const fs = require("fs");

// exports.getAll = factory.getAll(CashSale, [
//   { path: "salesRep", select: "id name" },
//   { path: "customer", select: "id name" },
// ]);
// exports.getOne = factory.getOne(CashSale, [
//   { path: "salesRep", select: "id name" },
//   { path: "customer", select: "id name" },
// ]);
// // exports.createOne = factory.createOne(CashSale);
// exports.updateOne = factory.updateOne(CashSale);
// exports.deleteOne = factory.deleteOne(CashSale);

// exports.getProductReport = catchAsync(async (req, res, next) => {
//   console.log(req.query);
//   const brandName = req.query.brandName;
//   const kindOfLiquor = req.query.kindOfLiquor;

//   const doc = await CashSale.aggregate([
//     {
//       $unwind: "$products",
//     },
//     {
//       $match: {
//         "products.kindOfLiquor": { $eq: `${kindOfLiquor}` },
//         "products.brandName": { $eq: `${brandName}` },
//       },
//     },
//     {
//       $group: {
//         _id: "$date",
//         count_1000_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 1000] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//         count_750_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 750] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//         count_500_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 500] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//         count_375_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 375] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//         count_180_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 180] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//         count_90_ml: {
//           $sum: {
//             $cond: [
//               { $eq: ["$products.bottleSize", 90] },
//               "$products.quantity",
//               0,
//             ],
//           },
//         },
//       },
//     },
//     {
//       $sort: { _id: 1 },
//     },
//   ]);

//   res.status(201).json({
//     isSuccess: true,
//     status: "success",
//     document: doc,
//   });
// });

// exports.createOne = catchAsync(async (req, res, next) => {
//   // console.log(req.body);
//   //   const fileName = req.body.date.substr(0, 10);

//   //   let recordTime = req.body.date;
//   //   recordTime = req.body.date.replace("T", " ");
//   //   recordTime = recordTime?.substr(0, 19);
//   //   recordTime = recordTime?.replaceAll("-", "/");

//   //   req.body.products.map((product) => {
//   //     const licenseIdNo = "01/2007/0003";
//   //     const dateTimeStamp = recordTime;
//   //     const gstin = "8908003033181";
//   //     const packSize = product.bottleSize;
//   //     const mrp = product.unitPrice;
//   //     const quantity = product.quantity;

//   //     const record = `${licenseIdNo}|${dateTimeStamp}|${gstin}|${packSize}|${mrp}|${quantity}\n`;
//   //     fs.appendFileSync(
//   //       `./data/exciseReports/2022/month/daily/${fileName}.txt`,
//   //       record
//   //     );
//   //     // console.log("SUCCESS");
//   //   });

//   const doc = await CashSale.create(req.body);

//   res.status(201).json({
//     isSuccess: true,
//     status: "success",
//     document: doc,
//   });
// });

// exports.getProductsSalesReport = catchAsync(async (req, res, next) => {
//   const type = req.query.type;
//   let doc;
//   if (type === "employee") {
//     doc = await CashSale.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "salesRep",
//           foreignField: "_id",
//           as: "salesRepDetails",
//         },
//       },
//       {
//         $group: {
//           // _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//           _id: {
//             salesRep: "$salesRep",
//             productName: "$products.name",
//             salesRepDetails: "$salesRepDetails",
//           },
//           // productDescription: { $sum: '$products.description' },
//           totalSoldQuantity: { $sum: "$products.quantity" },
//           // salesByEmployee: {
//           //     $push: {
//           //         salesRep: '$salesRep',
//           //         productName: '$products.name',
//           //         productDescription: '$products.description',
//           //         totalSoldQuantity: { $sum: '$products.quantity' },
//           //     }
//           // },
//         },
//       },
//       // {
//       //     $group: {
//       //         _id: { salesRep: '$salesRep', totalSoldQuantity: { $sum: '$products.quantity' } },
//       //     }
//       // },
//       // {
//       //     $lookup: {
//       //         from: "employees",
//       //         localField: "salesRep",
//       //         foreignField: "id",
//       //         as: "salesRepDetails"
//       //     }
//       // },
//       // {
//       //     $unwind: '$salesRepDetails'
//       // },
//       // {
//       //     $match: {
//       //         'salesRepDetails._id': { $eq: '$salesRep' }
//       //     }
//       // },
//       {
//         $sort: { totalSoldQuantity: -1 },
//       },
//     ]);
//   } else if (type === "time") {
//     doc = await CashSale.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//             productName: "$products.name",
//           },
//           totalSoldQuantity: { $sum: "$products.quantity" },
//         },
//       },
//       {
//         $sort: { _id: -1 },
//       },
//     ]);
//   } else if (type === "customer") {
//     doc = await CashSale.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $group: {
//           _id: {
//             customer: "$customer",
//             productName: "$products.name",
//             customerDetails: "$customerDetails",
//           },
//           totalSoldQuantity: { $sum: "$products.quantity" },
//         },
//       },
//       // {
//       //     $lookup: {
//       //         from: "customers",
//       //         let: { id: "$customer" },
//       //         pipeline: [{ $match: { $expr: { $eq: ["_id", "$id"] } } }],
//       //         as: "z"
//       //     }
//       // },
//       // {
//       //     $lookup: {
//       //         from: "customers",
//       //         let: { id: "$customer" },
//       //         pipeline: [
//       //             { $project: { _id: 1, bid: { "$toObjectId": "$$id" } } },
//       //             { $match: { $expr: { $eq: ["$_id", "$bid"] } } }
//       //         ],
//       //         as: "b"
//       //     }
//       // },
//       // {
//       //     $project: {
//       //         _id: 1,
//       //         customer: { "$toObjectId": "$customer" }
//       //     }
//       // },

//       {
//         $sort: { totalSoldQuantity: -1 },
//       },
//     ]);
//   }

//   res.status(201).json({
//     isSuccess: true,
//     status: "success",
//     document: doc,
//   });
// });
