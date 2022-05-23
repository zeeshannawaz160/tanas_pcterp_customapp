const Company = require("../models/companyModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

exports.getAllCompanies = factory.getAll(Company);
exports.getCompany = factory.getOne(Company);
// exports.createCompany = factory.createOne(Company);
exports.updateCompany = factory.updateOne(Company);
exports.deleteCompany = factory.deleteOne(Company);

// exports.companyList = catchAsync(async (req, res, next) => {
//     const document = await Company.find().select("id name");
//     console.log(document);
//     res.status(200).json({
//         isSuccess: true,
//         status: "success",
//         documents: document,
//     });
// });

// let storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "upload"),
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}-${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// let upload = multer({
//   storage,
// }).single("file");

exports.createCompany = catchAsync(async (req, res, next) => {
  console.log("body: ", req.query);
  // console.log("file: ", req.file);

  // upload(req, res, (err) => {
  //   if (err) {
  //     return next(new AppError(err.message, 404));
  //   }
  //   console.log("body2: ", req.file);
  // });
});

exports.getCompanyImage = catchAsync(async (req, res, next) => {
  let file;

  const directoryPath = path?.join(__dirname, "../", "upload");

  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach((file) => {
      console.log("file: ", file);
      file = file;
    });
  });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    file: file,
    path: directoryPath,
  });
});
