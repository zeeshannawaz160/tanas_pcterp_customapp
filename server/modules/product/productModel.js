const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");
const diffHistory = require('mongoose-diff-history/diffHistory')

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A Product must have a name"],
            trim: true,
            unique: true,
        },
        description: String,
        remark: String,
        uom: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Uom",
            },
            name: String
        }],
        HSNSACS: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "HSNSACS",
            },
            name: String
        }],
        cgstRate: Number,
        sgstRate: Number,
        igstRate: Number,
        cess: Number,
        type: {
            type: String,
            enum: ["Consumable", "Service", "Storable Product"],
            default: "Storable Product",
        },
        category: String,
        salesPrice: {
            type: Number,
            default: 0.0,
        },
        cost: {
            type: Number,
            default: 0.0,
        },
        barcode: String,
        totalPurchasedQuantity: {
            type: Number,
            default: 0,
        },
        totalSoldQuantity: {
            type: Number,
            default: 0,
        },
        location: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Location",
            },
            name: String
        }],
        onHand: {
            type: Number,
            default: 0,
        },
        available: {
            type: Number,
            default: 0,
        },
        commited: {
            type: Number,
            default: 0,
        },
        forecasted: {
            type: Number,
            default: 0,
        },
        averageCost: Number,
        incomeAccount: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "HSNSACS",
            },
            name: String
        }],
        expenseAccount: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "HSNSACS",
            },
            name: String
        }],
        assetAccount: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "HSNSACS",
            },
            name: String
        }],
        vendorTaxes: [String],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

// HSN/SAC Fields.
productSchema.add(
    {
        name: 'string',
        color: 'string',
        price: 'number'
    });













productSchema.plugin(autoIncrement.plugin, { model: "Product", field: "documentId", });
productSchema.plugin(diffHistory.plugin, {
    omit: [
        'updatedAt',
        'id']
});

productSchema.pre("save", async function (next) {
    this.barcode = "20222304" + padStart(this.productId, 4, "0");
    next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
