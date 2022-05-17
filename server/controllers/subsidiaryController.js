const Sibsidiary = require('../models/subsidiaryModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllSibsidiaries = factory.getAll(Sibsidiary, [{ path: 'createdBy' }]);
exports.getSibsidiary = factory.getOne(Sibsidiary);
exports.createSibsidiary = factory.createOne(Sibsidiary);
exports.updateSibsidiary = factory.updateOne(Sibsidiary);
exports.deleteSibsidiary = factory.deleteOne(Sibsidiary);
