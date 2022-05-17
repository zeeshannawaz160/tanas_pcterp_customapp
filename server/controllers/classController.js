const Class = require('../models/classModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllClasss = factory.getAll(Class, [{ path: 'createdBy' }]);
exports.getClass = factory.getOne(Class);
exports.createClass = factory.createOne(Class);
exports.updateClass = factory.updateOne(Class);
exports.deleteClass = factory.deleteOne(Class);