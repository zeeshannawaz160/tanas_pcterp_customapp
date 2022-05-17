const List = require('../models/listModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getListBySchemaId = catchAsync(async (req, res) => {
    const type = req.query.type;
    if (type) {

        const document = await List.find({ schemaId: type });
        res.status(200).json({
            isSuccess: true,
            status: 'success',
            results: document.length,
            document: document
        });
    }

});

exports.getAllLists = factory.getAll(List, { path: 'createdBy', select: 'id name' });
exports.getList = factory.getOne(List);
exports.createList = factory.createOne(List);
exports.updateList = factory.updateOne(List);
exports.deleteList = factory.deleteOne(List);