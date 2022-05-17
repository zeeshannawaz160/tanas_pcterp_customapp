const ItemCategory = require('../models/itemCategory');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getCategoryBySchemaId = catchAsync(async (req, res) => {
    const type = req.query.type;
    const name = req.query.name;
    const parent = req.query.parent;
    if (type && name) {
        const document = await ItemCategory.find({ schemaId: type, name: name });
        res.status(200).json({
            isSuccess: true,
            status: 'success',
            results: document.length,
            document: document
        });
    }
    else if (type && !name) {
        const document = await ItemCategory.find({ schemaId: type });
        res.status(200).json({
            isSuccess: true,
            status: 'success',
            results: document.length,
            document: document
        });
    }

    if (parent) {
        const document = await ItemCategory.find({ parent: parent });
        res.status(200).json({
            isSuccess: true,
            status: 'success',
            results: document.length,
            document: document
        });
    }

});

exports.updateCategory = catchAsync(async (req, res, next) => {
    let name = req.body.name;
    let parent = req.body.parent;
    console.log(req.params.id)
    let doc;
    if (name && parent) {
        console.log('if');
        doc = await ItemCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    }
    else if (name && !parent) {
        console.log('else if 1');
        doc = await ItemCategory.findByIdAndUpdate(req.params.id, {
            $set: { name: name }
        }, {
            new: false,
            runValidators: true
        });
    }
    else if (!name && parent) {
        console.log('else if 2');
        doc = await ItemCategory.findByIdAndUpdate(req.params.id, {
            $push: { parent: { $each: parent } }
        }, {
            new: false,
            runValidators: true
        });
    }

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        isSuccess: true,
        status: 'success',
        document: doc
    });
});

exports.getAllCategory = factory.getAll(ItemCategory)
exports.getCategory = factory.getOne(ItemCategory);
exports.createCategory = factory.createOne(ItemCategory);
// exports.updateCategory = factory.updateOne(ItemCategory);
exports.deleteCategory = factory.deleteOne(ItemCategory);