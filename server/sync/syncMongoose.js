// const Employee = require("../models/employeeModel");
// const Sync = require("../models/syncModel");
// const catchAsync = require("../utils/catchAsync");

// exports.employeeSync = catchAsync(async (req, res, next) => {

//     const syncDocument = await Sync.find();

//     const employeeDocument = await Employee.find().where('updatedAt').gte(syncDocument[0].lastSync)
//     console.log(employeeDocument)
// })
