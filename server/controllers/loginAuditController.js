const LoginAudit = require('../models/loginAudit');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllLoginAudits = factory.getAll(LoginAudit);
exports.getLoginAudit = factory.getOne(LoginAudit);
exports.createLoginAudit = factory.createOne(LoginAudit);
exports.updateLoginAudit = factory.updateOne(LoginAudit);
exports.deleteLoginAudit = factory.deleteOne(LoginAudit);