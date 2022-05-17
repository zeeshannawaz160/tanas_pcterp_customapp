const CustomDocumentType = require("../models/customDocumentTypeModel");
const AppCenter = require("../models/appCenterModel");
const AppNavigationCenter = require("../models/appNavigationCenter");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const diffHistory = require('mongoose-diff-history/diffHistory')


// CURD operation on Custom Record Type
exports.getAll = factory.getAll(CustomDocumentType);
exports.getOne = factory.getOne(CustomDocumentType);
exports.updateOne = catchAsync(async (req, res, next) => {
    // 1. Delete App Center
    // 2. Delete Navigation Center
    // 3. Delete Custom Record Type
    // 4. Delete Custom Document Collection

    // 1. Update Custom Document Type
    const doc = await CustomDocumentType.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    try {
        // Deleting App Navigation Center
        await AppNavigationCenter.findByIdAndUpdate(doc.navigationCenterId, { name: doc.documentTypeName }, {
            new: true,
            runValidators: true
        });

        // Deleting App Center
        await AppCenter.findByIdAndUpdate(doc.appCenterId, {
            name: doc.documentTypeName,
            abbreviation: doc.documentTypeName,
            color: doc.color,
            backgroundColor: doc.backgroundColor
        }, {
            new: true,
            runValidators: true
        })
        console.log(doc.documentTypeName, doc.appCenterId)

    } catch (e) {
        console.log(e)
    }


    res.status(200).json({
        isSuccess: true,
        status: 'success',
        document: doc
    });
});
exports.deleteOne = catchAsync(async (req, res, next) => {
    // 1. Delete App Center
    // 2. Delete Navigation Center
    // 3. Delete Custom Record Type
    // 4. Delete Custom Document Collection
    const document = await CustomDocumentType.findById(req.params.id);

    // Deleting App Navigation Center
    await AppNavigationCenter.deleteOne({ name: document.documentTypeName });

    // Deleting App Center
    await AppCenter.deleteOne({ name: document.documentTypeName })

    // Deleting Document Collection
    const documentSchema = mongoose.Schema({ name: String },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        });
    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);
    await Model.remove({});

    // Deleting Custom Document Type
    await CustomDocumentType.deleteOne({ _id: req.params.id })

    res.status(204).json({
        isSuccess: true,
        status: 'success',
        document: null
    });
});
exports.createOne = catchAsync(async (req, res, next) => {
    // Steps
    // 1. Create Navigation Center
    // 2. Create App Center (link step 1)
    // 3. Create Custom Document Type (link step 2)
    // 4. Create Collection (link step 3)

    // Creating Navigation Center
    const navCenterDoc = await AppNavigationCenter.create({
        name: req.body.documentTypeName,
    })

    // Creating Custom Document Type
    const document = await CustomDocumentType.create(req.body);


    // Creating App Center
    const appCenterDoc = await AppCenter.create({
        name: req.body.documentTypeName,
        abbreviation: req.body.documentTypeName,
        link: 'custommicroapp/list',
        navCneterLink: navCenterDoc._id,
        docType: document._id,
        color: document.color,
        backgroundColor: document.backgroundColor
    })

    await CustomDocumentType.findByIdAndUpdate({ _id: document._id }, { appCenterId: appCenterDoc._id, navigationCenterId: navCenterDoc._id })


    const documentSchema = mongoose.Schema({ name: String },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        });
    documentSchema.plugin(diffHistory.plugin, {
        omit: [
            'updatedAt',
            'id'
        ]
    });
    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });
});

exports.getDocumentTabs = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const document = await CustomDocumentType.findOne({ _id: req.query.docType })

    if (!document.documentTabs)
        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: null,
        });

    const tabs = document.documentTabs.map(tab => {
        return { name: tab.label, tabId: tab.tabId, _id: tab._id }
    });

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: tabs,
    });
});

// exports.addField = catchAsync(async (req, res, next) => {

//     console.log("DOC", req.body.documentTab)

//     if (req.body.displayLocation === "Normal") {
//         const document = await CustomDocumentType.findOneAndUpdate(
//             { _id: req.params.id },
//             { $push: { customFields: req.body } });

//         res.status(200).json({
//             isSuccess: true,
//             status: "success",
//             document: document,
//         });

//     }

//     try {
//         // const document = await CustomDocumentType.findOneAndUpdate(
//         //     { _id: req.params.id },
//         //     { "documentTabs": { $elemMatch: { "label": req.body.documentTab } } },
//         //     { $push: { 'documentTabs.$.customFields': req.body } });

//         const doc = await CustomDocumentType.findOneAndUpdate(
//             { _id: req.params.id, "documentTabs.label": req.body.documentTab },
//             {
//                 $push: { 'documentTabs.$.customFields': req.body }
//             });

//         console.log("DOC", doc.documentTabs)

//         res.status(200).json({
//             isSuccess: true,
//             status: "success",
//             document: doc,
//         });

//     } catch (e) {
//         console.log(e)
//     }





// });


exports.findCustomDocumentListSchema = catchAsync(async (req, res, next) => {
    let recordListSchema = new Object();
    let fieldsArray = new Array();

    if (!req.query) res.status(400).json({
        isSuccess: false,
        status: "failed",
        documents: { message: "Please provide Record Type!" },
    });
    const doc = await CustomDocumentType.findOne({ _id: req.query.docType });


    let documentId = new Object();
    documentId.label = "ID";
    documentId.fieldId = "name";
    documentId.type = "String";
    fieldsArray.push(documentId);

    doc.customFields.map(field => {
        let newField = new Object();
        newField.label = field.label;
        newField.fieldId = field.fieldId;
        newField.type = field.type;
        fieldsArray.push(newField);
    });

    let createdDate = new Object();
    createdDate.label = "Created At";
    createdDate.fieldId = "createdAt";
    createdDate.type = "Date";
    fieldsArray.push(createdDate);

    let updatedDate = new Object();
    updatedDate.label = "Updated At";
    updatedDate.fieldId = "updatedAt";
    updatedDate.type = "Date";
    fieldsArray.push(updatedDate);



    recordListSchema.label = doc.documentTypeName;
    recordListSchema.columns = fieldsArray;



    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: recordListSchema,
    });
});

exports.findCustomDocumentSchemaTabs = catchAsync(async (req, res, next) => {
    console.log("Incoming data", req.query.documentType)
    const document = await CustomDocumentType.findOne({ _id: req.params.id })

    if (!document.documentTabs)
        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: null,
        });

    const tabs = document.documentTabs.map(tab => {
        return { name: tab.label, _id: tab._id }
    });

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: tabs,
    });
});

exports.findCustomDocumentSchema = catchAsync(async (req, res, next) => {
    console.log("Incoming data gfd", req.query.documentType)
    const document = await CustomDocumentType.findOne({ documentTypeId: req.query.documentType });
    console.log(document)
    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });
});

exports.createOneCustomDocument = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })
    documentSchema.plugin(diffHistory.plugin, {
        omit: [
            'updatedAt',
            'id'
        ]
    });
    let document = await CustomDocumentType.findById({ _id: req.query.docType });
    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const doc = await Model.create(req.body)
    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: doc,
    });
});

exports.getOneCustomDocument = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const doc = await Model.findById(req.params.id)
    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: doc,
    });
});

exports.deleteOneCustomDocument = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const doc = await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({
        isSuccess: true,
        status: "success",
        document: null,
    });
});

exports.updateOneCustomDocument = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        __user: req.user ? { name: req.user.name, _id: req.user._id } : 'Unknown'
    });
    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: doc,
    });
});

exports.findAllCustomDocument = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })


    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const docs = await Model.find();


    res.status(200).json({
        isSuccess: true,
        status: "success",
        documents: docs,
    });
});


exports.getAllCustomDocuments = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })


    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    const docs = await Model.find();


    res.status(200).json({
        isSuccess: true,
        status: "success",
        documents: docs,
    });
});

exports.getAllFields = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    let subtabFields = new Array();
    for (let idx = 0; idx < document.documentTabs.length; idx++) {
        Array.prototype.push.apply(subtabFields, document.documentTabs[idx].customFields);
    }

    // below code will merge two array and assign into the first array
    const fieldCount = Array.prototype.push.apply(document.customFields, subtabFields);

    res.status(200).json({
        isSuccess: true,
        status: "success",
        results: fieldCount,
        document: document.customFields,
    });
});

exports.getOneField = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    let subtabFields = new Array();
    for (let idx = 0; idx < document.documentTabs.length; idx++) {
        Array.prototype.push.apply(subtabFields, document.documentTabs[idx].customFields);
    }

    // below code will merge two array and assign into the first array
    Array.prototype.push.apply(document.customFields, subtabFields);

    const field = document.customFields.find(x => x._id == req.params.id);

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: field,
    });
});

exports.createOneField = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    const document = await CustomDocumentType.findOneAndUpdate(
        { _id: req.query.docType, 'customFields.fieldId': { $ne: req.body.fieldId } },
        { $addToSet: { customFields: req.body } });

    if (!document)
        return next(new AppError('Field is already created', 404));

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });


    /*if (req.body.documentTab === "Body") {
        const document = await CustomDocumentType.findOneAndUpdate(
            { _id: req.query.docType, 'customFields.fieldId': { $ne: req.body.fieldId } },
            { $addToSet: { customFields: req.body } });

        console.log(document)

        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: document,
        });

    } else {

        const doc = await CustomDocumentType.findOneAndUpdate(
            {
                _id: req.query.docType,
                "documentTabs._id": req.body.documentTab,
                "documentTabs.customFields.fieldId": { $ne: req.body.fieldId }
            },
            {
                $addToSet: { 'documentTabs.$.customFields': req.body }
            });

        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: doc,
        });

    }*/


});

exports.updateOneField = catchAsync(async (req, res, next) => {
    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    const document = await CustomDocumentType.findOneAndUpdate(
        { _id: req.query.docType, 'customFields._id': req.params.id, 'customFields.fieldId': { $eq: req.body.fieldId } },
        { $set: { 'customFields.$': req.body } });

    if (!document)
        return next(new AppError('Field is already created', 404));

    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });


    /*if (req.body.displayLocation === "Body") {
        const document = await CustomDocumentType.findOneAndUpdate(
            { _id: req.query.docType, 'customFields._id': req.params.id },
            { $set: { 'customFields.$': req.body } });

        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: document,
        });

    } else {
        const document = await CustomDocumentType.findOneAndUpdate(
            {
                _id: req.query.docType,
                "documentTabs._id": req.body.documentTab,
                'documentTabs.customFields._id': req.params.id
            },
            { $set: { 'documentTabs.$.customFields.$[element]': req.body } },
            { arrayFilters: [{ "element._id": { $eq: req.params.id } }] });

        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: document,
        });

    }*/

});

exports.deleteOneField = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    const document = await CustomDocumentType.findOneAndUpdate(
        { _id: req.query.docType, 'customFields._id': req.params.id },
        { $pull: { customFields: { _id: req.params.id } } });


    res.status(200).json({
        isSuccess: true,
        status: "success",
        document: document,
    });


    // if (req.body.displayLocation === "Body") {


    // } else {

    //     const doc = await CustomDocumentType.findOneAndUpdate(
    //         {
    //             _id: req.query.docType,
    //             "documentTabs._id": req.body.documentTab,
    //             "documentTabs.customFields.fieldId": { $ne: req.body.fieldId }
    //         },
    //         {
    //             $pull: { 'documentTabs.$.customFields': req.body }
    //         });

    //     res.status(200).json({
    //         isSuccess: true,
    //         status: "success",
    //         document: doc,
    //     });

    // }

});

exports.getDocumentSchema = catchAsync(async (req, res, next) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    if (!req.query.viewType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });

    if (req.query.viewType === 'form') {
        const document = await CustomDocumentType.findOne({ _id: req.query.docType });

        let subtabs = new Array();

        for (let idx = 0; idx < document.documentTabs.length; idx++) {
            let tabId = document.documentTabs[idx].tabId;
            let label = document.documentTabs[idx].label;
            let tabType = document.documentTabs[idx].tabType;
            let fields = new Array();
            for (let jdx = 0; jdx < document.customFields.length; jdx++) {
                let displayLocation = document.customFields[jdx].displayLocation;

                if (tabId == displayLocation) {

                    fields.push(document.customFields[jdx])
                }
            }

            subtabs.push({
                label: label,
                tabId: tabId,
                tabType: tabType,
                customFields: fields
            })
        }

        // Updating document
        const newDocument = new Object();
        newDocument._id = document._id
        newDocument.documentTypeName = document.documentTypeName
        newDocument.documentTypeId = document.documentTypeId
        newDocument.documentTabs = subtabs
        newDocument.customFields = document.customFields
        newDocument.roles = document.roles

        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: newDocument,
        });
    }

    if (req.query.viewType === 'list') {
        let recordListSchema = new Object();
        let fieldsArray = new Array();

        const doc = await CustomDocumentType.findOne({ _id: req.query.docType });

        // let documentId = new Object();
        // documentId.label = "ID";
        // documentId.fieldId = "documentId";
        // documentId.type = "String";
        // fieldsArray.push(documentId);

        doc.customFields.map(field => {
            if (field.displayLocation !== "Body") return;
            let newField = new Object();
            newField.label = field.label;
            newField.fieldId = field.fieldId;
            newField.type = field.type;
            fieldsArray.push(newField);
        });

        let createdDate = new Object();
        createdDate.label = "Created At";
        createdDate.fieldId = "createdAt";
        createdDate.type = "Date";
        fieldsArray.push(createdDate);

        let updatedDate = new Object();
        updatedDate.label = "Updated At";
        updatedDate.fieldId = "updatedAt";
        updatedDate.type = "Date";
        fieldsArray.push(updatedDate);

        recordListSchema.label = doc.documentTypeName;
        recordListSchema.columns = fieldsArray;



        res.status(200).json({
            isSuccess: true,
            status: "success",
            document: recordListSchema,
        });
    }

});

exports.getHistories = catchAsync(async (req, res) => {

    if (!req.query.docType)
        return res.status(200).json({
            isSuccess: true,
            status: "success",
            document: {
                errorMessage: "Please pass docType",
                message: "Allah Hu Akbar!"
            },
        });
    const documentSchema = mongoose.Schema(
        {
            name: String
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            timestamps: true,
            strict: false
        })

    let document = await CustomDocumentType.findById({ _id: req.query.docType });

    const Model = mongoose.models[`${document.modelName}`] || mongoose.model(`${document.modelName}`, documentSchema);

    console.log(document.modelName)
    const historiesDoc = await diffHistory.getDiffs(`${document.modelName}`, req.params.id, []);

    res.status(200).json({
        isSuccess: true,
        status: 'success',
        results: historiesDoc.length,
        documents: historiesDoc
    });
});