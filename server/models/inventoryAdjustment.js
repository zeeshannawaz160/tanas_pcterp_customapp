const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const padStart = require('lodash.padstart');
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

const inventoryAdjustmentSchema = mongoose.Schema({
    name: String,
    inventoryAdjustmentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    date: Date,
    total: Number,
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        description: String,
        quantity: Number,
        unitPrice: Number,
        subTotal: Number,
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
    }],
    journalItems: [{
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
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
    field: "inventoryAdjustmentId"
});

inventoryAdjustmentSchema.pre('save', async function (next) {
    this.name = "INV/ADJUSTMENT/2021/10/" + padStart(this.inventoryAdjustmentId, 4, '0');
    next();
});

const InventoryAdjustmentModel = mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);

module.exports = InventoryAdjustmentModel;