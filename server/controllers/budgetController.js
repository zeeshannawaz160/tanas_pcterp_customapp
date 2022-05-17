const Budget = require('../models/budgetModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllBudgets = factory.getAll(Budget, [{ path: 'createdBy', select: 'id name' }, { path: 'employee', select: 'id name' }, { path: 'subsidiary', select: 'id name' }, { path: 'department', select: 'id name' }]);
exports.getBudget = factory.getOne(Budget);
exports.createBudget = factory.createOne(Budget);
exports.updateBudget = factory.updateOne(Budget);
exports.deleteBudget = factory.deleteOne(Budget);