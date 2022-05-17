const GLImpact = require('../models/glImpactModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllGLImpacts = factory.getAll(GLImpact);
exports.getGLImpact = factory.getOne(GLImpact, [{ path: 'transactionType' }]);
exports.createGLImpact = factory.createOne(GLImpact);
exports.updateGLImpact = factory.updateOne(GLImpact);
exports.deleteGLImpact = factory.deleteOne(GLImpact);

exports.getGLImpactByTransactionType = catchAsync((req, res, next) => {

});

