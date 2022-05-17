const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const productDeliverySchema = mongoose.Schema(
  {
    name: String,
    customer: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      name: String
    }],
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
    },
    backOrderOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductDelivery",
    },
    isFullyDelivered: {
      type: Boolean,
      default: false,
    },
    isProductAvailable: {
      type: Boolean,
      default: true,
    },
    operations: [
      {
        productIdentifier: String,
        product: [{
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          name: String
        }],
        name: String,
        description: String,
        demandQuantity: Number,
        doneQuantity: Number,
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    notes: String,
    status: {
      type: String,
      enum: ["Draft", "Waiting", "Ready", "Done"],
      default: "Ready",
    },
    estimation: {
      untaxedAmount: Number,
      tax: Number,
      igst: Number,
      cgst: Number,
      sgst: Number,
      total: Number,
    },
    deliveryAddress: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

productDeliverySchema.plugin(autoIncrement.plugin, {
  model: "ProductDelivery",
  field: "productDeliveryId",
  startAt: 1,
});

productDeliverySchema.pre("save", async function (next) {
  this.name = "WH/OUT/" + padStart(this.productDeliveryId, 4, "0");
  next();
});

const ProductDelivery = mongoose.model(
  "ProductDelivery",
  productDeliverySchema
);
module.exports = ProductDelivery;
