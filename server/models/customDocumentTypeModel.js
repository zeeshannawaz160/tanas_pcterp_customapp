const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
/*

const customDocumentTypeSchema = mongoose.Schema(
    {
        modelName: String,
        documentTypeName: {
            type: String,
            trim: true,
            unique: true,
            required: [true, 'Please enter Custom Document Type Name.']
        },
        documentTypeId: {
            type: String,
            trim: true,
            unique: true,
            required: [true, 'Please enter Custom Document Type Id.'],
            lowercase: true
        },
        documentTabs: [{
            label: {
                type: String
            },
            tabId: {
                type: String,
                lowercase: true
            },
            tabType: {
                type: String,
                enum: ['Line', 'Block'],
                default: 'Block'
            },
            customFields: [
                {
                    label: String,
                    fieldId: String,
                    description: String,
                    validationMessage: {
                        type: String,
                        required: function () {

                            return this.required === true;
                        },
                        trim: true
                    },
                    type: {
                        type: String,
                        enum: ['String', 'Long String', 'Number', 'Date', 'Boolean', 'App', 'Decimal128'],
                        default: 'String'
                    },
                    required: {
                        type: Boolean,
                        default: false
                    },
                    defaultValue: mongoose.Schema.Types.Mixed,
                    selectRecordType: {
                        type: String,
                        required: function () {
                            return this.type === 'App';
                        }
                    },
                    displayType: {
                        type: String,
                        enum: ['Normal', 'Disabled', 'Hidden'],
                        default: 'Normal'
                    },
                    displayLocation: {
                        type: String,
                        default: 'Body'
                    },
                }
            ]

        }],
        customFields: [{
            label: String,
            fieldId: String,
            description: String,
            validationMessage: {
                type: String,
                required: function () {
                    console.log(this.required === true)
                    return this.required === true;
                },
                trim: true
            },
            type: {
                type: String,
                enum: ['String', 'Long String', 'Number', 'Date', 'Boolean', 'App', 'Decimal128'],
                default: 'String'
            },
            required: {
                type: Boolean,
                default: false
            },
            defaultValue: mongoose.Schema.Types.Mixed,
            selectRecordType: {
                type: String,
                required: function () {
                    return this.type === 'App';
                }
            },
            displayType: {
                type: String,
                enum: ['Normal', 'Disabled', 'Hidden'],
                default: 'Normal'
            },
            displayLocation: {
                type: String,
                enum: ['Body', 'Tab'],
                default: 'Body'
            },
        }]

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

*/

const customDocumentTypeSchema = mongoose.Schema({
    modelName: String,
    navigationCenterId: mongoose.Schema.Types.ObjectId,
    appCenterId: mongoose.Schema.Types.ObjectId,
    color: String,
    backgroundColor: String,
    documentTypeName: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Please enter Custom Document Type Name.']
    },
    documentTypeId: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Please enter Custom Document Type Id.'],
        lowercase: true
    },
    documentTabs: [{
        label: {
            type: String
        },
        tabId: {
            type: String,
            lowercase: true
        },
        tabType: {
            type: String,
            enum: ['Line', 'Block'],
            default: 'Block'
        }
    }],
    customFields: [{
        label: String,
        fieldId: String,
        description: String,
        validationMessage: {
            type: String,
            required: function () {
                return this.required === true;
            },
            trim: true
        },
        type: {
            type: String,
            enum: ['String', 'Long String', 'Number', 'Date', 'Boolean', 'App', 'Decimal'],
            default: 'String'
        },
        required: {
            type: Boolean,
            default: false
        },
        defaultValue: mongoose.Schema.Types.Mixed,
        selectRecordType: {
            type: String,
            required: function () {
                return this.type === 'App';
            }
        },
        displayType: {
            type: String,
            enum: ['Normal', 'Disabled', 'Hidden'],
            default: 'Normal'
        },
        displayLocation: {
            type: String,
            default: 'Body'
        }
    }]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

// Here you can add more field to the base schema of USER
customDocumentTypeSchema.add({
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }
    ],
    // prefix: String,
    // suffix: String,
    // paddingNumber: String,
    // startAt: String
});

customDocumentTypeSchema.plugin(autoIncrement.plugin, {
    model: "CustomDocumentType",
    field: "documentId",
});

customDocumentTypeSchema.pre('save', async function (next) {
    this.modelName = this.documentTypeName.replace(/\s/g, "");
    next();
});


const CustomDocumentType = mongoose.model("CustomDocumentType", customDocumentTypeSchema);
module.exports = CustomDocumentType;
