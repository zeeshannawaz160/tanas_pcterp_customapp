const Item = require('../models/itemModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllItems = factory.getAll(Item, [{ path: 'subsidiary', select: 'id name' }]);
exports.getItem = factory.getOne(Item);
exports.createItem = factory.createOne(Item);
exports.updateItem = factory.updateOne(Item);
exports.deleteItem = factory.deleteOne(Item);

exports.getItemByName = catchAsync(async (req, res, next) => {
    const document = await Item.find({ name: req.params.name })
    console.log(document)
    res.status(200).json({
        isSuccess: true,
        status: 'success',
        document: document
    });

    //const document = await Item.find({ name: });
});

exports.updateOnHandQuantity = catchAsync(async (req, res, next) => {
    console.log(req.body)
    console.log(req.params)
    const document = await Item.findByIdAndUpdate(req.params.id, { $inc: { 'onHand': req.body.onHand } }, {
        new: true
    })

    res.status(200).json({
        isSuccess: true,
        status: 'success',
        document: document
    });

})