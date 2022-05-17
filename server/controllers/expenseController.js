const Expense = require('../models/expenseModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllExpenses = factory.getAll(Expense);
exports.getExpense = factory.getOne(Expense);
exports.createExpense = factory.createOne(Expense);
exports.updateExpense = factory.updateOne(Expense);
exports.deleteExpense = factory.deleteOne(Expense);