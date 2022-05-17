const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");
const padStart = require('lodash.padstart');

// FIELDS ARE >>>
const rfqSchema = mongoose.Schema({
    name: String,
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    vendorReference: String,
    orderDeadline: {
        type: Date,
        default: Date.now
    },
    receiptDate: {
        type: Date,
        default: Date.now
    },
    askConfirmation: Boolean,
    productReceipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductReceipt'
    },
    vendorBill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    },
    status: {
        type: String,
        enum: ['RFQ', 'RFQ Sent', 'Purchase Order'],
        default: 'RFQ'
    },
    billingStatus: {
        type: String,
        enum: ['Nothing to Bill', 'Waiting Bills', 'Fully Billed'],
        default: 'Nothing to Bill'
    },
    total: Number,
    purchaseRep: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        description: String,
        quantity: Number,
        unitPrice: Number,
        subTotal: Number,
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }
    }]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

rfqSchema.plugin(autoIncrement.plugin, {
    model: "PurchaseOrder",
    field: "purchaseOrderId",
    startAt: 1
});

rfqSchema.pre('save', async function (next) {
    this.name = "PO" + padStart(this.purchaseOrderId, 4, '0');
    next();
});


const RFQ = mongoose.model('RFQ', rfqSchema);
module.exports = RFQ;