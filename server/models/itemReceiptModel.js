const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");
const padStart = require('lodash.padstart');


// FIELDS ARE >>>
const itemReceiptSchema = mongoose.Schema({
    name: String,
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    scheduledDate: {
        type: Date,
        default: Date.now
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    sourceDocument: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrder"
    },
    operations: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            demandQuantity: Number,
            doneQuantity: Number
        }
    ],
    notes: String,
    status: {
        type: String,
        enum: ['Draft', 'Waiting', 'Ready', 'Done'],
        default: 'Ready'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

itemReceiptSchema.plugin(autoIncrement.plugin, {
    model: "ItemReceipt",
    field: "itemReceiptId",
    startAt: 1
});

itemReceiptSchema.pre('save', async function (next) {
    this.name = "WH/IN/" + padStart(this.itemReceiptId, 4, '0');
    next();
});


const ItemReceipt = mongoose.model('ItemReceipt', itemReceiptSchema);
module.exports = ItemReceipt;