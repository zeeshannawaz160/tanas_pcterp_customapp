const Sync = require('../models/syncModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAll = factory.getAll(Sync);
exports.getOne = factory.getOne(Sync);
exports.createOne = factory.createOne(Sync);
exports.updateOne = factory.updateOne(Sync);
exports.deleteOne = factory.deleteOne(Sync);
