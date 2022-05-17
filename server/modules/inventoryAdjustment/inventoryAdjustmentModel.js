const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const padStart = require('lodash.padstart');
const diffHistory = require('mongoose-diff-history/diffHistory')

const inventoryAdjustmentSchema = mongoose.Schema({
    name: String,
    inventoryAdjustmentAccount: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
        name: String
    }],
    date: Date,
    total: Number,
    products: [{
        product: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            name: String

        }],
        description: String,
        quantity: Number,
        unitPrice: Number,
        subTotal: Number,
        account: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Account"
            },
            name: String
        }]
    }],
    journalItems: [{
        account: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account'
            },
            name: String
        }],
        label: String,
        debit: Number,
        credit: Number
    }]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
)

inventoryAdjustmentSchema.plugin(autoIncrement.plugin, {
    model: "InventoryAdjustment",
    field: "documentId"
});

inventoryAdjustmentSchema.plugin(diffHistory.plugin, {
    omit: [
        'updatedAt',
        'id'
    ]
});

const dateObject = new Date();
inventoryAdjustmentSchema.pre('save', async function (next) {
    this.name = `INV/ADJUSTMENT/${dateObject.getFullYear()}/${dateObject.getMonth() + 1}/` + padStart(this.inventoryAdjustmentId, 4, '0');
    next();
});

const InventoryAdjustmentModel = mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);

module.exports = InventoryAdjustmentModel;