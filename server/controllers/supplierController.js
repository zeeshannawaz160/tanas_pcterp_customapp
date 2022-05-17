const Supplier = require('../models/supplierModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllSuppliers = factory.getAll(Supplier, [{ path: 'createdBy' }, { path: 'supplier' }]);
exports.getSupplier = factory.getOne(Supplier);
exports.createSupplier = factory.createOne(Supplier);
exports.updateSupplier = factory.updateOne(Supplier);
exports.deleteSupplier = factory.deleteOne(Supplier);
