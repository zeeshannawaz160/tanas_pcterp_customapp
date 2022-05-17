const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ProductReceipt = require('../models/productReceiptModel');
const ProductDelivery = require('../models/productDeliveryModel');


exports.getAll = catchAsync(async (req, res, next) => {

    const transfers = new Array();
    const productReceiveDocument = await ProductReceipt.find();
    const productDeliveryDocument = await ProductDelivery.find();
    productReceiveDocument.map(document => {
        const transfer = new Object();
        transfer.name = document.name;
        transfer.entity = document.vendor.name;
        transfer.responsible = document.createdBy;
        transfer.date = document.name;
        transfer.sourceDocument = document.name;
        transfer.operationType = document.name;
        transfer.status = document.name;
        transfers.push(transfer);

    })


    res.status(200).json({
        isSuccess: true,
        status: 'success',
        results: doc.length,
        documents: doc
    });
});
// exports.getOne = factory.getOne(WorkCenter);
// exports.createOne = factory.createOne(WorkCenter);
// exports.updateOne = factory.updateOne(WorkCenter);
// exports.deleteOne = factory.deleteOne(WorkCenter);
